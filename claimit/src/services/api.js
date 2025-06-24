// src/services/api.js
import axios from 'axios';

const BASE_URL = 'https://claimit-backend-q4jj.onrender.com'; // <- paste your latest valid URL here

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
