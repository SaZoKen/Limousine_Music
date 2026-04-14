import React from 'react';
import './Result.css';

function Result({ score, total, answers, questions, onRestart }) {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <div className="result-container">
      <h2>Результаты теста</h2>
      <div className="score-circle">
        <div className="score-number">{score}/{total}</div>
        <div className="score-percent">{percentage}%</div>
      </div>
      <div className="answers-review">
        <h3>Детализация:</h3>
        {questions.map((q, idx) => (
          <div key={idx} className="review-item">
            <p className="review-question">{idx+1}. {q.text || q.question_text}</p>
            <p className={`review-answer ${answers[idx] === q.correct ? 'correct' : 'wrong'}`}>
              Ваш ответ: {answers[idx] !== null ? q.options[answers[idx]] : 'Не выбран'} 
              {answers[idx] !== q.correct && ` (Правильный: ${q.options[q.correct]})`}
            </p>
          </div>
        ))}
      </div>
      <button className="restart-btn" onClick={onRestart}>
        Вернуться к списку тестов
      </button>
    </div>
  );
}

export default Result;