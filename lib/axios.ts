import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://gorest.co.in/public/v2',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
