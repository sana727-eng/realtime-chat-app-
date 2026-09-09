import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { socket } from '../socket';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
      socket.connect();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount pattern
    fetchMe();
  }, []);

  const register = async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.data.user);
    socket.connect();
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- context + hook co-located intentionally
export const useAuth = () => useContext(AuthContext);