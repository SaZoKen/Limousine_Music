import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Вход</h2>
      {error && <p style={{ color: '
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 20, border: 'none' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 20, border: 'none' }} />
        <button type="submit" className="next-btn">Войти</button>
      </form>
      <p style={{ marginTop: 15 }}>Нет аккаунта? <Link to="/register" style={{ color: 'white' }}>Зарегистрироваться</Link></p>
    </div>
  );
}

export default LoginPage;