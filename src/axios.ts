import axios from 'axios';

const telegramAxios = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5003',
});

export default telegramAxios;