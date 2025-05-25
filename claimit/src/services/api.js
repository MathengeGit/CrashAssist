import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // change to actual IP when deploying or testing on mobile
});

export default api;
