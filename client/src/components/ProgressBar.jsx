import React from 'react';
import './ProgressBar.css';

function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span>Вопрос {current} из {total}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

export default ProgressBar;