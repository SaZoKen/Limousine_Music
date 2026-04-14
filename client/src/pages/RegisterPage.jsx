import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await register(name, email, password, role);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Регистрация</h2>
      {error && <p style={{ color: '#ffb3b3' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 20, border: 'none' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 20, border: 'none' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 20, border: 'none' }}
        />
        <div style={{ marginBottom: 15 }}>
          <label style={{ marginRight: 20 }}>
            <input type="radio" value="student" checked={role === 'student'} onChange={e => setRole(e.target.value)} /> Ученик
          </label>
          <label>
            <input type="radio" value="teacher" checked={role === 'teacher'} onChange={e => setRole(e.target.value)} /> Учитель
          </label>
        </div>
        <button type="submit" className="next-btn">Зарегистрироваться</button>
      </form>
      <p style={{ marginTop: 15 }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: 'white' }}>Войти</Link>
      </p>
    </div>
  );
}

export default RegisterPage;