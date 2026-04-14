import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './TestCreator.css';

function TestCreator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correct: 0 }
  ]);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index, text) => {
    const newQ = [...questions];
    newQ[index].text = text;
    setQuestions(newQ);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[optIndex] = value;
    setQuestions(newQ);
  };

  const setCorrect = (qIndex, optIndex) => {
    const newQ = [...questions];
    newQ[qIndex].correct = optIndex;
    setQuestions(newQ);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTest({ title, description, questions });
      navigate('/teacher');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="test-creator">
      <h2>Создание теста</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Название теста"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="test-input"
        />
        <div className="form-actions" style={{ gap: '20px', marginTop: '40px' }}></div>
        <textarea
          placeholder="Описание (необязательно)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="test-textarea"
        />

        <h3>Вопросы</h3>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="question-block">
            <div className="question-header">
              <input
                type="text"
                placeholder={`Вопрос ${qIndex + 1}`}
                value={q.text}
                onChange={e => updateQuestionText(qIndex, e.target.value)}
                required
                className="question-input"
              />
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qIndex)} className="remove-btn">✕</button>
              )}
            </div>
            {q.options.map((opt, optIndex) => (
              <div key={optIndex} className="option-row">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correct === optIndex}
                  onChange={() => setCorrect(qIndex, optIndex)}
                />
                <input
                  type="text"
                  placeholder={`Вариант ${optIndex + 1}`}
                  value={opt}
                  onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                  required
                  className="option-input"
                />
              </div>
            ))}
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="add-btn">
          ➕ Добавить вопрос
        </button>
        <div className="form-actions">
          <button type="submit" className="save-btn">Сохранить тест</button>
          <button type="button" onClick={() => navigate('/teacher')} className="cancel-btn">Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default TestCreator;