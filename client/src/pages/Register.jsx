import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);
  try {
    await register(username, email, password);
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
  } finally {
    setSubmitting(false);
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && (
        <p style={{ color: '#fecaca', backgroundColor: '#7f1d1d', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}>
          {error}
        </p>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={submitting}
        required
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={submitting}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Registering in...' : 'Register'}
      </button>
    </form>
  );
}

export default Register;