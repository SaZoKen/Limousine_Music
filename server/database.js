const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new Database(path.join(__dirname, 'test.db'));


db.exec(`
  -- Пользователи (учитель/ученик)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Тесты (создаются учителем)
  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE
  );

  -- Вопросы теста
  CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL,
    correct INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    FOREIGN KEY (test_id) REFERENCES tests (id) ON DELETE CASCADE
  );

  -- Сессии прохождения тестов
  CREATE TABLE IF NOT EXISTS test_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    finished_at DATETIME,
    score INTEGER,
    FOREIGN KEY (student_id) REFERENCES users (id),
    FOREIGN KEY (test_id) REFERENCES tests (id)
  );

  -- Ответы ученика
  CREATE TABLE IF NOT EXISTS session_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_index INTEGER,
    is_correct INTEGER NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions (id),
    FOREIGN KEY (question_id) REFERENCES test_questions (id)
  );
`);


function initializeDefaultTests() {
  
  const testCount = db.prepare('SELECT COUNT(*) as count FROM tests').get().count;
  if (testCount > 0) {
    console.log('Тесты уже существуют, пропускаем инициализацию.');
    return;
  }

  console.log('Создаём системного учителя и стандартные тесты...');

  
  let teacher = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com');
  if (!teacher) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
    const info = stmt.run('Системный учитель', 'admin@example.com', hashedPassword, 'teacher');
    teacher = { id: info.lastInsertRowid };
  }

  
  const insertTest = (title, description, questionsData) => {
    const testStmt = db.prepare('INSERT INTO tests (teacher_id, title, description) VALUES (?, ?, ?)');
    const testInfo = testStmt.run(teacher.id, title, description);
    const testId = testInfo.lastInsertRowid;

    const questionStmt = db.prepare(`
      INSERT INTO test_questions (test_id, question_text, options, correct, position)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((questions) => {
      questions.forEach((q, idx) => {
        questionStmt.run(testId, q.text, JSON.stringify(q.options), q.correct, idx);
      });
    });

    insertMany(questionsData);
    console.log(`Тест "${title}" создан с ${questionsData.length} вопросами.`);
  };

  
  const juniorQuestions = [
  { id: 1, text: "Что такое HTML?", options: ["Язык разметки", "Язык программирования", "Стиль", "База данных"], correct: 0 },
  { id: 2, text: "Какой тег используется для создания ссылки?", options: ["<a>", "<link>", "<href>", "<url>"], correct: 0 },
  { id: 3, text: "Что делает CSS?", options: ["Описывает внешний вид", "Управляет сервером", "Создает анимацию", "Хранит данные"], correct: 0 },
  { id: 4, text: "Как объявить переменную в JavaScript?", options: ["var", "let", "const", "Все варианты"], correct: 3 },
  { id: 5, text: "Что такое React?", options: ["Библиотека", "Фреймворк", "Язык", "База данных"], correct: 0 },
  { id: 6, text: "Какое расширение у файла JavaScript?", options: [".js", ".html", ".css", ".jsx"], correct: 0 },
  { id: 7, text: "Что такое массив?", options: ["Упорядоченная коллекция", "Функция", "Объект", "Строка"], correct: 0 },
  { id: 8, text: "Какой оператор используется для сравнения по значению?", options: ["==", "=", "===", "!="], correct: 0 },
  { id: 9, text: "Что такое DOM?", options: ["Объектная модель документа", "База данных", "Стиль", "Скрипт"], correct: 0 },
  { id: 10, text: "Какой метод добавляет элемент в конец массива?", options: ["push()", "pop()", "shift()", "unshift()"], correct: 0 },
  { id: 11, text: "Что выведет console.log(typeof null)?", options: ["null", "object", "undefined", "number"], correct: 1 },
  { id: 12, text: "Как объявить функцию в JS?", options: ["function myFunc() {}", "def myFunc()", "func myFunc()", "create myFunc()"], correct: 0 },
  { id: 13, text: "Что такое Flexbox?", options: ["Технология вёрстки", "База данных", "Язык", "Фреймворк"], correct: 0 },
  { id: 14, text: "Какое значение CSS делает элемент невидимым?", options: ["display: none", "visibility: hidden", "opacity: 0", "Все варианты"], correct: 3 },
  { id: 15, text: "Что означает API?", options: ["Интерфейс программирования приложений", "Абстрактный программный интерфейс", "Оба варианта", "Ни один"], correct: 2 },
  { id: 16, text: "Что такое JSON?", options: ["Формат данных", "Язык", "База данных", "Стиль"], correct: 0 },
  { id: 17, text: "Какой HTTP-метод используется для получения данных?", options: ["GET", "POST", "PUT", "DELETE"], correct: 0 },
  { id: 18, text: "Что делает ключевое слово 'const' в JS?", options: ["Объявляет константу", "Объявляет переменную", "Создаёт класс", "Импортирует модуль"], correct: 0 },
  { id: 19, text: "Что такое Git?", options: ["Система контроля версий", "Язык", "Фреймворк", "База данных"], correct: 0 },
  { id: 20, text: "Какой тег используется для вставки изображения?", options: ["<img>", "<image>", "<pic>", "<src>"], correct: 0 }
];

const middleQuestions = [
  { id: 1, text: "Что такое замыкание в JavaScript?", options: ["Функция + доступ к внешним переменным", "Вложенная функция", "Объект", "Массив"], correct: 0 },
  { id: 2, text: "Как работает event loop?", options: ["Очередь задач", "Многопоточность", "Синхронно", "Асинхронно"], correct: 0 },
  { id: 3, text: "Что такое Virtual DOM?", options: ["Копия реального DOM", "Новый стандарт", "Библиотека", "Язык"], correct: 0 },
  { id: 4, text: "Для чего нужен хук useEffect?", options: ["Побочные эффекты", "Состояние", "Рендер", "Мемоизация"], correct: 0 },
  { id: 5, text: "Что такое JSX?", options: ["Расширение JS", "Новый язык", "Компилятор", "Стиль"], correct: 0 },
  { id: 6, text: "Что такое Spread оператор?", options: ["...", "**", "&&", "??"], correct: 0 },
  { id: 7, text: "Как создать React-компонент как функцию?", options: ["function App() {}", "const App = () => {}", "Оба варианта", "Ни один"], correct: 2 },
  { id: 8, text: "Что такое PropTypes?", options: ["Проверка типов", "Стили", "Хуки", "Контекст"], correct: 0 },
  { id: 9, text: "Что делает метод map()?", options: ["Создаёт новый массив", "Изменяет исходный", "Удаляет элементы", "Сортирует"], correct: 0 },
  { id: 10, text: "Что такое async/await?", options: ["Синтаксис для промисов", "Цикл", "Условие", "Массив"], correct: 0 },
  { id: 11, text: "Что такое деструктуризация?", options: ["Извлечение данных из объектов/массивов", "Удаление", "Копирование", "Объединение"], correct: 0 },
  { id: 12, text: "Как обработать форму в React?", options: ["Управляемые компоненты", "Неуправляемые", "Оба варианта", "Через jQuery"], correct: 2 },
  { id: 13, text: "Что такое Context API?", options: ["Глобальное состояние", "Локальное состояние", "Роутинг", "Стили"], correct: 0 },
  { id: 14, text: "Какой метод жизненного цикла используется вместо componentDidMount в хуках?", options: ["useEffect с []", "useState", "useCallback", "useMemo"], correct: 0 },
  { id: 15, text: "Что такое React Router?", options: ["Библиотека для маршрутизации", "Управление состоянием", "Стилизация", "Тестирование"], correct: 0 },
  { id: 16, text: "Что такое семантическая верстка?", options: ["Использование осмысленных тегов", "Адаптивность", "Анимация", "Доступность"], correct: 0 },
  { id: 17, text: "Какой HTTP-статус означает 'Успешно'?", options: ["200", "404", "500", "301"], correct: 0 },
  { id: 18, text: "Что такое CORS?", options: ["Механизм безопасности", "База данных", "Протокол", "Язык"], correct: 0 },
  { id: 19, text: "Что делает метод reduce()?", options: ["Сворачивает массив в одно значение", "Фильтрует", "Ищет элемент", "Сортирует"], correct: 0 },
  { id: 20, text: "Что такое Babel?", options: ["Транспилятор JS", "Сборщик", "Линтер", "Тестировщик"], correct: 0 }
];

const seniorQuestions = [
  { id: 1, text: "Что такое мемоизация?", options: ["Кэширование результатов функций", "Оптимизация циклов", "Работа с памятью", "Сборка мусора"], correct: 0 },
  { id: 2, text: "Как работает прототипное наследование?", options: ["Цепочка прототипов", "Классы", "Функции", "Объекты"], correct: 0 },
  { id: 3, text: "Что такое Web Workers?", options: ["Многопоточность в браузере", "Сервис-воркеры", "API", "События"], correct: 0 },
  { id: 4, text: "Объясните принцип работы Redux", options: ["Единый стор, действия, редьюсеры", "Компоненты", "Хуки", "Контекст"], correct: 0 },
  { id: 5, text: "Что такое tree shaking?", options: ["Удаление мёртвого кода", "Оптимизация дерева", "Анимация", "Сборка"], correct: 0 },
  { id: 6, text: "Что такое Event Delegation?", options: ["Обработка событий через родителя", "Прямая обработка", "Прерывание событий", "Глобальные события"], correct: 0 },
  { id: 7, text: "Что такое WeakMap?", options: ["Сборщик мусора для ключей-объектов", "Обычный объект", "Массив", "Строка"], correct: 0 },
  { id: 8, text: "Что такое HOC в React?", options: ["Компонент высшего порядка", "Хук", "Контекст", "Роутинг"], correct: 0 },
  { id: 9, text: "Что такое Suspense?", options: ["Ожидание асинхронной загрузки", "Обработка ошибок", "Мемоизация", "Стилизация"], correct: 0 },
  { id: 10, text: "Что такое React.memo?", options: ["Мемоизация компонента", "Мемоизация значения", "Хук", "Контекст"], correct: 0 },
  { id: 11, text: "Что такое Server Side Rendering (SSR)?", options: ["Рендер на сервере", "Рендер на клиенте", "Статическая генерация", "Гибрид"], correct: 0 },
  { id: 12, text: "Что такое Code Splitting?", options: ["Разделение кода на чанки", "Объединение кода", "Минификация", "Обфускация"], correct: 0 },
  { id: 13, text: "Что такое Proxy в JS?", options: ["Перехват операций над объектом", "Сервер", "Сеть", "Класс"], correct: 0 },
  { id: 14, text: "Что такое WebSocket?", options: ["Полнодуплексный канал связи", "HTTP", "WebRTC", "API"], correct: 0 },
  { id: 15, text: "Что такое Service Worker?", options: ["Фоновый скрипт для кэширования и уведомлений", "Воркер", "Событие", "Запрос"], correct: 0 },
  { id: 16, text: "Что такое Shadow DOM?", options: ["Изолированное DOM-дерево", "Виртуальный DOM", "Реальный DOM", "Скопированный DOM"], correct: 0 },
  { id: 17, text: "Что такое Microfrontends?", options: ["Архитектура для разделения фронтенда", "Микросервисы", "Библиотека", "Фреймворк"], correct: 0 },
  { id: 18, text: "Что такое Refs в React?", options: ["Прямой доступ к DOM", "Состояние", "Хуки", "Контекст"], correct: 0 },
  { id: 19, text: "Что такое useCallback?", options: ["Мемоизация функции", "Мемоизация значения", "Эффект", "Состояние"], correct: 0 },
  { id: 20, text: "Что такое useMemo?", options: ["Мемоизация вычисляемого значения", "Мемоизация функции", "Эффект", "Состояние"], correct: 0 }
];

  insertTest('Junior', 'Базовые вопросы для начинающих', juniorQuestions);
  insertTest('Middle', 'Вопросы среднего уровня', middleQuestions);
  insertTest('Senior', 'Сложные вопросы для экспертов', seniorQuestions);

  console.log('Инициализация стандартных тестов завершена.');
}


initializeDefaultTests();

console.log('База данных готова.');
module.exports = db;