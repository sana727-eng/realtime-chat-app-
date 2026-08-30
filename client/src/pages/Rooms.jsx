import { useEffect, useState } from 'react';
import { fetchRooms, createRoomApi } from '../api/rooms';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const { user } = useAuth();

  const loadRooms = async () => {
    const res = await fetchRooms();
    setRooms(res.data.rooms);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // listen for incoming messages once, for the lifetime of the component
  useEffect(() => {
    const handleReceive = (message) => {
      // only show messages for the room currently open
      setMessages((prev) => [...prev, message]);
    };

    socket.on('message:receive', handleReceive);

    return () => {
      socket.off('message:receive', handleReceive);
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createRoomApi(newRoomName);
    setNewRoomName('');
    loadRooms();
  };

  const handleJoin = (roomId) => {
    if (activeRoomId) {
      socket.emit('room:leave', activeRoomId);
    }
    socket.emit('room:join', roomId);
    setActiveRoomId(roomId);
    setMessages([]); // clear old room's messages from view
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoomId) return;
    socket.emit('message:send', { roomId: activeRoomId, content: messageInput });
    setMessageInput('');
  };

  return (
    <div>
      <form onSubmit={handleCreate}>
        <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Room name" required />
        <button type="submit">Create Room</button>
      </form>

      <ul>
        {rooms.map((room) => (
          <li key={room._id}>
            {room.name}
            <button onClick={() => handleJoin(room._id)}>
              {activeRoomId === room._id ? 'Joined' : 'Join'}
            </button>
          </li>
        ))}
      </ul>

      {activeRoomId && (
        <div style={{ border: '1px solid #444', padding: 12, marginTop: 16 }}>
          <div style={{ height: 200, overflowY: 'auto', marginBottom: 8 }}>
            {messages.map((msg) => (
              <div key={msg._id}>
              <strong>{msg.senderId === user.id ? 'You' : msg.senderUsername}:</strong> {msg.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
            <input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
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