import { useEffect, useRef, useState } from 'react';
import { fetchRooms, createRoomApi } from '../api/rooms';
import { fetchRoomMessages } from '../api/messages';
import { fetchOnlineUsers } from '../api/presence';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';
import { formatMessageTime } from '../utils/formatTime';
import Spinner from '../components/Spinner';


function Rooms({ connected, user, logout }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendError, setSendError] = useState('');


  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const messageListRef = useRef(null);


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
      const ids = new Set(res.data.onlineUserIds);
      ids.add(user.id); // you are always online in your own view
      setOnlineUserIds(ids);
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
  }, [user.id]);

  // listen for incoming live messages, with a duplicate guard
  useEffect(() => {
    const handleReceive = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev; // already have it
        return [...prev, message];
      });
    };

    const handleMessageError = (errMsg) => {
      setSendError(errMsg);
      setTimeout(() => setSendError(''), 4000); // auto-clear after a few seconds
    };

    socket.on('message:receive', handleReceive);
    socket.on('message:error', handleMessageError);

    return () => {
      socket.off('message:receive', handleReceive);
      socket.off('message:error', handleMessageError);
    };
  }, []);

  // typing indicator listeners, scoped to the currently active room
  useEffect(() => {
    const handleUserStarted = ({ userId, roomId }) => {
      if (roomId !== activeRoomId) return;
      setTypingUsers((prev) => new Set(prev).add(userId));
    };

    const handleUserStopped = ({ userId, roomId }) => {
      if (roomId !== activeRoomId) return;
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    socket.on('typing:userStarted', handleUserStarted);
    socket.on('typing:userStopped', handleUserStopped);

    return () => {
      socket.off('typing:userStarted', handleUserStarted);
      socket.off('typing:userStopped', handleUserStopped);
    };
  }, [activeRoomId]);

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
    if (activeRoomId === roomId) return;

    if (activeRoomId) {
      socket.emit('room:leave', activeRoomId);
      socket.emit('typing:stop', { roomId: activeRoomId });
    }

    socket.emit('room:join', roomId);
    setActiveRoomId(roomId);
    setTypingUsers(new Set());
    setMessagesLoading(true);

    try {
      const res = await fetchRoomMessages(roomId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error('Failed to load message history', err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }

  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!activeRoomId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing:start', { roomId: activeRoomId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('typing:stop', { roomId: activeRoomId });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoomId) return;

    socket.emit('message:send', { roomId: activeRoomId, content: messageInput.trim() });
    setMessageInput('');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    socket.emit('typing:stop', { roomId: activeRoomId });
  };

  const getTypingLabel = () => {
    if (typingUsers.size === 0) return null;
    const names = Array.from(typingUsers).map((uid) => {
      const found = messages.find((m) => m.senderId === uid);
      return found ? found.senderUsername : 'Someone';
    });
    return `${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} typing...`;
  };
  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    // only auto-scroll if the user is already near the bottom (within 100px)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [activeRoomId]);

  return (
    <div className="app-layout"> {!connected && (
      <div className="disconnect-banner">
        Connection lost — trying to reconnect...
      </div>
    )}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user">
            <span className={`status-dot ${connected ? 'online' : 'offline'}`} />
            {user.username}
          </div>
          <button onClick={logout} style={{ padding: '4px 10px', fontSize: 13 }}>
            Logout
          </button>
        </div>

        <div className="room-list">
          {rooms.length === 0 ? (
            <p className="empty-state">No rooms yet.</p>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                className={`room-item ${activeRoomId === room._id ? 'active' : ''}`}
                onClick={() => handleJoin(room._id)}
              >
                <span>{room.name}</span>
                {activeRoomId === room._id && (
                  <span style={{ fontSize: 12, color: '#22c55e' }}>●</span>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCreate} className="create-room-form">
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            maxLength={50}
            type="text"
            style={{ flex: 1 }}
            required
          />
          <button type="submit">+</button>
        </form>
      </aside>

      <main className="main-panel">
        {!activeRoomId ? (
          <div className="empty-state" style={{ margin: 'auto' }}>
            Select a room to start chatting.
          </div>
        ) : (
          <>
            <div className="chat-header">
              {rooms.find((r) => r._id === activeRoomId)?.name}
            </div>

            <div className="message-list" ref={messageListRef}>
              {messagesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <p className="empty-state">No messages yet — say hello.</p>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === user.id;
                  const prevMsg = messages[index - 1];
                  // only show the sender's name/avatar if it's a different sender than the previous message
                  const showMeta = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <div key={msg._id} className={`message-row ${isOwn ? 'own' : 'other'}`}>
                      {!isOwn && (
                        <div style={{ marginRight: 8, width: 24 }}>
                          {showMeta && (
                            <div className="avatar-initial">
                              {msg.senderUsername?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                        {showMeta && !isOwn && (
                          <div className="message-meta">
                            <span
                              className={`status-dot ${onlineUserIds.has(msg.senderId) ? 'online' : 'offline'}`}
                            />
                            {msg.senderUsername}
                          </div>
                        )}
                        <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                          {msg.content}
                        </div>
                        <div className="message-timestamp">{formatMessageTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
              {getTypingLabel() && (
                <p style={{ color: '#888', fontStyle: 'italic', fontSize: 14 }}>
                  {getTypingLabel()}
                </p>
              )}
              {sendError && (
                <p style={{ color: '#fecaca', backgroundColor: '#7f1d1d', padding: '6px 12px', fontSize: 13, margin: 0 }}>
                  {sendError}
                </p>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="message-input-form">
              <input
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                maxLength={2000}
                type="text"
                style={{ flex: 1 }}
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Rooms;