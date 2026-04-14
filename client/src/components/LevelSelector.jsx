import React, { useState } from 'react';
import AddQuestionModal from './AddQuestionModal';
import './LevelSelector.css';

function LevelSelector({ onSelectLevel }) {
  const [showModal, setShowModal] = useState(false);

  const levels = [
    { id: 'junior', name: 'Junior', description: 'Базовые знания', icon: '🌱' },
    { id: 'middle', name: 'Middle', description: 'Уверенный уровень', icon: '⚡' },
    { id: 'senior', name: 'Senior', description: 'Эксперт', icon: '🚀' }
  ];

  const handleAddSuccess = () => {
    alert('Вопрос успешно добавлен!');
  };

  return (
    <div className="level-selector">
      <h1 className="level-title">Выбери свой уровень</h1>
      <div className="level-cards">
        {levels.map(level => (
          <button
            key={level.id}
            className="level-btn liquid-glass"
            onClick={() => onSelectLevel(level.id)}
          >
            <span className="level-icon">{level.icon}</span>
            <span className="level-name">{level.name}</span>
            <span className="level-desc">{level.description}</span>
          </button>
        ))}
      </div>
      <button 
        className="add-question-btn" 
        onClick={() => setShowModal(true)}
        style={{ marginTop: '30px', padding: '10px 20px', borderRadius: '30px', background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', cursor: 'pointer' }}
      >
        ➕ Добавить свой вопрос
      </button>
      {showModal && (
        <AddQuestionModal 
          onClose={() => setShowModal(false)} 
          onSuccess={handleAddSuccess} 
        />
      )}
    </div>
  );
}

export default LevelSelector;