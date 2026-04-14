import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import TestCreator from './pages/TestCreator';
import TestTaker from './pages/TestTaker';
import EditTest from './pages/EditTest';
import './App.css';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-container"><div className="glass-card">Загрузка...</div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} />;
  return children;
}

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
      <div className="glass-card">
        {user && (
          <div className="user-header">
            <span>👤 {user.name} ({user.role === 'teacher' ? 'Учитель' : 'Ученик'})</span>
            <button onClick={logout} className="logout-btn">Выйти</button>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/create" element={<PrivateRoute role="teacher"><TestCreator /></PrivateRoute>} />
          {/* 👇 Вот этот маршрут добавь */}
          <Route path="/teacher/edit/:id" element={<PrivateRoute role="teacher"><EditTest /></PrivateRoute>} />
          <Route path="/test/:id" element={<PrivateRoute><TestTaker /></PrivateRoute>} />
          <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;