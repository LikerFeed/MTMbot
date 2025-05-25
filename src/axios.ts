import axios from 'axios';

const telegramAxios = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
});

export default telegramAxios;