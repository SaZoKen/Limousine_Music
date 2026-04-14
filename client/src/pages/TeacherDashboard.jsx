import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadTests = async () => {
    try {
      const data = await api.getTests();
      setTests(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить тест?')) return;
    try {
      await api.deleteTest(id);
      setTests(tests.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h2>📝 Мои тесты</h2>
        <button className="create-btn" onClick={() => navigate('/teacher/create')}>
          ➕ Создать тест
        </button>
      </div>
      {tests.length === 0 ? (
        <p className="empty-message">У вас пока нет созданных тестов</p>
      ) : (
        <div className="tests-grid">
          {tests.map(test => (
            <div key={test.id} className="test-card">
              <div className="test-card-header">
                <h3>{test.title}</h3>
                <span className="questions-count">{test.questions_count} вопросов</span>
              </div>
              {test.description && <p className="test-description">{test.description}</p>}
              <div className="test-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/teacher/edit/${test.id}`)}
                >
                  ✏️ Редактировать
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(test.id)}
                >
                  🗑️ Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;