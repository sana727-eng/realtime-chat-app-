import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useSocketStatus } from './hooks/useSocketStatus';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';

function App() {
  const { user, loading, logout } = useAuth();
  const connected = useSocketStatus();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <p style={{ padding: '2rem' }}>Loading...</p>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', fontFamily: 'sans-serif' }}>
        {showRegister ? <Register /> : <Login />}
        <button onClick={() => setShowRegister(!showRegister)} style={{ marginTop: 12 }}>
          {showRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div>
          <strong>Logged in as:</strong> {user.username}
        </div>
        <div>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: connected ? '#22c55e' : '#ef4444',
            marginRight: 6,
          }} />
          {connected ? 'Socket connected' : 'Socket disconnected'}
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      <Rooms />
    </div>
  );
}

export default App;