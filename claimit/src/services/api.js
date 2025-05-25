import axios from 'axios';

const api = axios.create({
  baseURL: 'https://b633-105-161-154-185.ngrok-free.app/api', // change to actual IP when deploying or testing on mobile
});

export default api;
