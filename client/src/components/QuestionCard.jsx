import React from 'react';
import './QuestionCard.css';

function QuestionCard({ question, selectedAnswer, onAnswer }) {
  // Защита от undefined (пока вопросы не загружены)
  if (!question || !question.options) {
    return (
      <div className="question-card">
        <h2 className="question-text">Загрузка вопроса...</h2>
      </div>
    );
  }

  return (
    <div className="question-card">
      <h2 className="question-text">{question.text}</h2>
      <div className="options-list">
        {question.options.map((opt, idx) => (
          <label key={idx} className={`option-item ${selectedAnswer === idx ? 'selected' : ''}`}>
            <input
              type="radio"
              name="question"
              value={idx}
              checked={selectedAnswer === idx}
              onChange={() => onAnswer(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default QuestionCard;