import React, { useState } from 'react';
import './AddQuestionModal.css';

function AddQuestionModal({ onClose, onSuccess }) {
  const [level, setLevel] = useState('junior');
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || options.some(opt => !opt.trim())) {
      alert('Заполните все поля');
      return;
    }

    const newQuestion = { level, text, options, correct };
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });
      if (response.ok) {
        onSuccess && onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при добавлении');
      }
    } catch (err) {
      console.error(err);
      alert('Сетевая ошибка');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <h2>Добавить новый вопрос</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Уровень:</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="junior">Junior</option>
              <option value="middle">Middle</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div className="form-group">
            <label>Текст вопроса:</label>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Введите вопрос"
              required
            />
          </div>
          <div className="form-group">
            <label>Варианты ответов (4 штуки):</label>
            {options.map((opt, idx) => (
              <div key={idx} className="option-input">
                <input
                  type="text"
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  placeholder={`Вариант ${idx + 1}`}
                  required
                />
                <label>
                  <input
                    type="radio"
                    name="correct"
                    checked={correct === idx}
                    onChange={() => setCorrect(idx)}
                  />
                  Правильный
                </label>
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn">Сохранить</button>
            <button type="button" onClick={onClose} className="cancel-btn">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddQuestionModal;