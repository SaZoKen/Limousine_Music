import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './StudentDashboard.css'; // создадим новый файл стилей

function StudentDashboard() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testsData, resultsData] = await Promise.all([
          api.getTests(),
          api.getResults()
        ]);
        setTests(testsData);
        setResults(resultsData);
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  // Создаём объект для быстрого поиска последнего результата по test_id
  const resultsByTestId = {};
  results.forEach(r => {
    // Если несколько попыток, оставляем последнюю (с самым поздним finished_at)
    if (!resultsByTestId[r.test_id] || new Date(r.finished_at) > new Date(resultsByTestId[r.test_id].finished_at)) {
      resultsByTestId[r.test_id] = r;
    }
  });

  return (
    <div className="student-dashboard">
      <h1>📚 Доступные тесты</h1>
      {tests.length === 0 ? (
        <p className="empty-message">Пока нет доступных тестов</p>
      ) : (
        <div className="tests-grid">
          {tests.map(test => {
            const lastResult = resultsByTestId[test.id];
            return (
              <div key={test.id} className="test-card">
                <div className="test-card-header">
                  <h3>{test.title}</h3>
                  <span className="questions-count">{test.questions_count} вопросов</span>
                </div>
                {test.description && <p className="test-description">{test.description}</p>}
                <p className="teacher-name">👨‍🏫 {test.teacher_name}</p>
                {lastResult && (
                  <div className="last-result">
                    Последний результат: {lastResult.score} / {lastResult.total_questions} ({Math.round((lastResult.score / lastResult.total_questions) * 100)}%)
                  </div>
                )}
                <Link to={`/test/${test.id}`} className="start-test-btn">
                  {lastResult ? '🔄 Пройти заново' : '🚀 Начать тест'}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <h2 style={{ marginTop: 40 }}>📊 Мои результаты</h2>
      {results.length === 0 ? (
        <p className="empty-message">Вы ещё не проходили тесты</p>
      ) : (
        <div className="results-list">
          {results.slice().sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at)).map(r => (
            <div key={r.id} className="result-item">
              <div className="result-info">
                <strong>{r.title}</strong>
                <span>{new Date(r.finished_at).toLocaleDateString()}</span>
              </div>
              <div className="result-score">
                {r.score} / {r.total_questions} ({Math.round((r.score / r.total_questions) * 100)}%)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;