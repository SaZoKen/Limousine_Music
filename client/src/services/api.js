const API_BASE = '/api';

const getToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка запроса');
  }
  return response.json();
};

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Tests
  getTests: () => request('/tests'),
  getTest: (id) => request(`/tests/${id}`),
  createTest: (data) => request('/tests', { method: 'POST', body: JSON.stringify(data) }),
  deleteTest: (id) => request(`/tests/${id}`, { method: 'DELETE' }),

  // Taking test
  startSession: (testId) => request(`/tests/${testId}/start`, { method: 'POST' }),
  submitSession: (sessionId, answers) => request(`/sessions/${sessionId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Results
  getResults: () => request('/results'),

  updateTest: (id, data) => request(`/tests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};