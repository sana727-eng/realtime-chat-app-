import { useEffect, useState } from 'react';
import { fetchRooms, createRoomApi } from '../api/rooms';
import { fetchRoomMessages } from '../api/messages';
import { fetchOnlineUsers } from '../api/presence';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const { user } = useAuth();

  const loadRooms = async () => {
    const res = await fetchRooms();
    setRooms(res.data.rooms);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // load initial presence snapshot + listen for live presence changes
  useEffect(() => {
    fetchOnlineUsers().then((res) => {
      setOnlineUserIds(new Set(res.data.onlineUserIds));
    });

    const handleOnline = ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));
    };

    const handleOffline = ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('presence:online', handleOnline);
    socket.on('presence:offline', handleOffline);

    return () => {
      socket.off('presence:online', handleOnline);
      socket.off('presence:offline', handleOffline);
    };
  }, []);

  // listen for incoming live messages, with a duplicate guard
  useEffect(() => {
    const handleReceive = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev; // already have it
        return [...prev, message];
      });
    };

    const handleMessageError = (errMsg) => {
      console.error('Message error:', errMsg);
      // optional: surface this to the user with a toast/banner instead of console
    };

    socket.on('message:receive', handleReceive);
    socket.on('message:error', handleMessageError);

    return () => {
      socket.off('message:receive', handleReceive);
      socket.off('message:error', handleMessageError);
    };
  }, []);

  // re-join the active room automatically if the socket reconnects
  useEffect(() => {
    const handleReconnect = () => {
      if (activeRoomId) {
        socket.emit('room:join', activeRoomId);
      }
    };

    socket.on('reconnect', handleReconnect);
    return () => socket.off('reconnect', handleReconnect);
  }, [activeRoomId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    await createRoomApi(newRoomName.trim());
    setNewRoomName('');
    loadRooms();
  };

  const handleJoin = async (roomId) => {
    if (activeRoomId === roomId) return; // already in this room, no-op

    if (activeRoomId) {
      socket.emit('room:leave', activeRoomId);
    }

    socket.emit('room:join', roomId);
    setActiveRoomId(roomId);

    try {
      const res = await fetchRoomMessages(roomId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load message history', err);
      setMessages([]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoomId) return;
    socket.emit('message:send', { roomId: activeRoomId, content: messageInput.trim() });
    setMessageInput('');
  };

  return (
    <div>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Room name"
          maxLength={50}
          required
        />
        <button type="submit">Create Room</button>
      </form>

      {rooms.length === 0 ? (
        <p style={{ color: '#888' }}>No rooms yet — create one to get started.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.map((room) => (
            <li
              key={room._id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
            >
              <span>{room.name}</span>
              <button onClick={() => handleJoin(room._id)}>
                {activeRoomId === room._id ? 'Joined' : 'Join'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeRoomId && (
        <div style={{ border: '1px solid #444', padding: 12, marginTop: 16 }}>
          <div style={{ height: 200, overflowY: 'auto', marginBottom: 8 }}>
            {messages.length === 0 ? (
              <p style={{ color: '#888' }}>No messages yet — say hello.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: onlineUserIds.has(msg.senderId) ? '#22c55e' : '#666',
                      marginRight: 6,
                    }}
                  />
                  <strong>{msg.senderId === user.id ? 'You' : msg.senderUsername}:</strong>{' '}
                  {msg.content}
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={2000}
              style={{ flex: 1 }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Rooms;