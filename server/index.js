const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');
const { generateToken, verifyToken, requireRole } = require('./auth');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());




app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ error: 'Роль должна быть student или teacher' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, email, hashedPassword, role);
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(info.lastInsertRowid);
    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});




app.get('/api/tests', verifyToken, (req, res) => {
  try {
    let query = `
      SELECT t.id, t.title, t.description, t.created_at,
             u.name as teacher_name,
             (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as questions_count
      FROM tests t
      JOIN users u ON t.teacher_id = u.id
    `;
    let params = [];
    if (req.user.role === 'teacher') {
      query += ' WHERE t.teacher_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY t.created_at DESC';
    const tests = db.prepare(query).all(...params);
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/api/tests', verifyToken, requireRole('teacher'), (req, res) => {
  try {
    const { title, description, questions } = req.body;
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Название и хотя бы один вопрос обязательны' });
    }

    const insertTest = db.prepare('INSERT INTO tests (teacher_id, title, description) VALUES (?, ?, ?)');
    const info = insertTest.run(req.user.id, title, description || '');
    const testId = info.lastInsertRowid;

    const insertQuestion = db.prepare(`
      INSERT INTO test_questions (test_id, question_text, options, correct, position)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((questionsList) => {
      for (let i = 0; i < questionsList.length; i++) {
        const q = questionsList[i];
        insertQuestion.run(testId, q.text, JSON.stringify(q.options), q.correct, i);
      }
    });
    insertMany(questions);

    const newTest = db.prepare('SELECT * FROM tests WHERE id = ?').get(testId);
    res.status(201).json(newTest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.get('/api/tests/:id', verifyToken, (req, res) => {
  try {
    const testId = req.params.id;
    const test = db.prepare(`
      SELECT t.*, u.name as teacher_name
      FROM tests t
      JOIN users u ON t.teacher_id = u.id
      WHERE t.id = ?
    `).get(testId);
    if (!test) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    const questions = db.prepare(`
      SELECT id, question_text, options, correct, position
      FROM test_questions
      WHERE test_id = ?
      ORDER BY position
    `).all(testId).map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json({ ...test, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.delete('/api/tests/:id', verifyToken, requireRole('teacher'), (req, res) => {
  try {
    const testId = req.params.id;
    const test = db.prepare('SELECT teacher_id FROM tests WHERE id = ?').get(testId);
    if (!test) {
      return res.status(404).json({ error: 'Тест не найден' });
    }
    if (test.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Вы не можете удалить чужой тест' });
    }
    db.prepare('DELETE FROM tests WHERE id = ?').run(testId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});




app.post('/api/tests/:id/start', verifyToken, requireRole('student'), (req, res) => {
  try {
    const testId = req.params.id;
    const stmt = db.prepare('INSERT INTO test_sessions (student_id, test_id) VALUES (?, ?)');
    const info = stmt.run(req.user.id, testId);
    res.json({ sessionId: info.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.post('/api/sessions/:sessionId/submit', verifyToken, (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { answers } = req.body; 

    const session = db.prepare('SELECT * FROM test_sessions WHERE id = ?').get(sessionId);
    if (!session) return res.status(404).json({ error: 'Сессия не найдена' });
    if (session.student_id !== req.user.id) {
      return res.status(403).json({ error: 'Чужая сессия' });
    }
    if (session.finished_at) {
      return res.status(400).json({ error: 'Тест уже завершён' });
    }

    const insertAnswer = db.prepare(`
      INSERT INTO session_answers (session_id, question_id, answer_index, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    let correctCount = 0;
    const transaction = db.transaction((ansList) => {
      for (const ans of ansList) {
        const question = db.prepare('SELECT correct FROM test_questions WHERE id = ?').get(ans.questionId);
        const isCorrect = (question.correct === ans.selectedIndex) ? 1 : 0;
        if (isCorrect) correctCount++;
        insertAnswer.run(sessionId, ans.questionId, ans.selectedIndex, isCorrect);
      }
    });
    transaction(answers);

    db.prepare('UPDATE test_sessions SET finished_at = CURRENT_TIMESTAMP, score = ? WHERE id = ?')
      .run(correctCount, sessionId);

    res.json({ score: correctCount, total: answers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


app.get('/api/results', verifyToken, requireRole('student'), (req, res) => {
  try {
    
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
    console.log('Таблицы в БД:', tables.map(t => t.name));
    
    const sessions = db.prepare(`
      SELECT 
        ts.id, 
        ts.started_at, 
        ts.finished_at, 
        ts.score,
        t.title, 
        t.id as test_id,
        (SELECT COUNT(*) FROM test_questions WHERE test_id = t.id) as total_questions
      FROM test_sessions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.student_id = ? AND ts.finished_at IS NOT NULL
      ORDER BY ts.finished_at DESC
    `).all(req.user.id);
    
    res.json(sessions);
  } catch (err) {
    console.error('Ошибка в /api/results:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http:
});

app.put('/api/tests/:id', verifyToken, requireRole('teacher'), (req, res) => {
  try {
    const testId = req.params.id;
    const { title, description, questions } = req.body;
    
    
    const test = db.prepare('SELECT teacher_id FROM tests WHERE id = ?').get(testId);
    if (!test) return res.status(404).json({ error: 'Тест не найден' });
    if (test.teacher_id !== req.user.id) return res.status(403).json({ error: 'Доступ запрещён' });
    
    
    db.prepare('UPDATE tests SET title = ?, description = ? WHERE id = ?')
      .run(title, description || '', testId);
    
    
    db.prepare('DELETE FROM test_questions WHERE test_id = ?').run(testId);
    
    
    const insertQuestion = db.prepare(`
      INSERT INTO test_questions (test_id, question_text, options, correct, position)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((questionsList) => {
      questionsList.forEach((q, idx) => {
        insertQuestion.run(testId, q.text, JSON.stringify(q.options), q.correct, idx);
      });
    });
    insertMany(questions);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});