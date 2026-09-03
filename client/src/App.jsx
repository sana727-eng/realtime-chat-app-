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

  return <Rooms connected={connected} logout={logout} user={user} />;
}

export default App;