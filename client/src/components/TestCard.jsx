import React from 'react';
import './TestCard.css';

function TestCard({ test, onDelete, showDelete }) {
  return (
    <div className="test-card">
      <h3>{test.title}</h3>
      {test.description && <p>{test.description}</p>}
      <div className="test-meta">
        <span>👨‍🏫 {test.teacher_name}</span>
        <span>❓ {test.questions_count} вопросов</span>
      </div>
      {showDelete && (
        <button className="delete-btn" onClick={() => onDelete(test.id)}>Удалить</button>
      )}
    </div>
  );
}

export default TestCard;