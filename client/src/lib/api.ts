import axios from 'axios';

const API_BASE_URL = 'https://ai-quiz-generator-ln53.onrender.com'; // Replace with your actual backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// // Response interceptor to handle auth errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex?: number;
}

export interface Quiz {
  _id: string;
  title?: string;
  topic: string;
  questions: Question[];
  duration: number;
  isAIgenerated: boolean;
  roomCode: string;
  creator: string;
  createdAt: string;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: string[];
  correctAnswers: string[];
  timeTaken: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  timeTaken: number;
}

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },
};

// Quiz API
export const quizAPI = {
  createQuiz: async (data: {
    title: string;
    topic: string;
    questions: Question[];
    duration: number;
    isAIgenerated: boolean;
  }) => {
    const response = await api.post('/api/quizzes/', data);
    return response.data;
  },

  generateAIQuiz: async (data: { topic: string; numberOfQuestions: number }) => {
    const response = await api.post('/api/quizzes/ai/generate', data);
    return response.data;
  },

  saveAIQuiz: async (data: { topic: string; questions: Question[]; duration: number }) => {
    const response = await api.post('/api/quizzes/ai/save', data);
    return response.data;
  },

  getUserQuizzes: async () => {
    const response = await api.get('/api/quizzes/user/all');
    return response.data;
  },

  getQuizByRoomCode: async (roomCode: string) => {
    const response = await api.get(`/api/quizzes/${roomCode}`);
    return response.data;
  },

  submitQuiz: async (roomCode: string, data: { answers: string[]; timeTaken: number }) => {
    const response = await api.post(`/api/quizzes/${roomCode}/submit`, data);
    return response.data;
  },

  getQuizResult: async (roomCode: string) => {
    const response = await api.get(`/api/quizzes/${roomCode}/result`);
    return response.data;
  },

  getLeaderboard: async (roomCode: string) => {
    const response = await api.get(`/api/quizzes/${roomCode}/leaderboard`);
    return response.data;
  },

  getAnalytics: async (roomCode: string) => {
    const response = await api.get(`/api/quizzes/${roomCode}/analytics`);
    return response.data;
  },
};

export default api;
