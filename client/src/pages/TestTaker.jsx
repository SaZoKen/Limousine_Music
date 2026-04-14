import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';
import Result from '../components/Result';
import { shuffleArray } from '../utils/shuffle';

function TestTaker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadTest = async () => {
      try {
        const data = await api.getTest(id);
        setTest(data);
        // Перемешиваем вопросы и варианты
        const shuffled = shuffleArray(data.questions).map(q => {
          const indices = Array.from({ length: q.options.length }, (_, i) => i);
          const shuffledIndices = shuffleArray(indices);
          const shuffledOptions = shuffledIndices.map(i => q.options[i]);
          const newCorrect = shuffledIndices.indexOf(q.correct);
          return { ...q, options: shuffledOptions, correct: newCorrect };
        });
        setQuestions(shuffled);
        setAnswers(Array(shuffled.length).fill(null));

        const session = await api.startSession(id);
        setSessionId(session.sessionId);
      } catch (err) {
        alert(err.message);
        navigate('/student');
      }
    };
    loadTest();
  }, [id, navigate]);

  const handleAnswer = (idx) => {
    const newAns = [...answers];
    newAns[current] = idx;
    setAnswers(newAns);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      // Завершить тест
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    try {
      const answerData = answers.map((ans, i) => ({
        questionId: questions[i].id,
        selectedIndex: ans
      }));
      const result = await api.submitSession(sessionId, answerData);
      setScore(result.score);
      setFinished(true);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!test || !sessionId) return <div style={{ color: 'white' }}>Загрузка...</div>;

  if (finished) {
    return (
      <Result
        score={score}
        total={questions.length}
        answers={answers}
        questions={questions}
        onRestart={() => navigate('/student')}
      />
    );
  }

  return (
    <>
      <ProgressBar current={current + 1} total={questions.length} />
      <QuestionCard
        question={questions[current]}
        selectedAnswer={answers[current]}
        onAnswer={handleAnswer}
      />
      <button
        className="next-btn liquid-glass"
        onClick={handleNext}
        disabled={answers[current] === null}
      >
        {current + 1 === questions.length ? 'Завершить' : 'Далее'}
      </button>
    </>
  );
}

export default TestTaker;