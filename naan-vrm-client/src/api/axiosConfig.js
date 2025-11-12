import axios from 'axios';

// 1. Create central axios instance with our server URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🔗 API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL
});

// 2. This is the "key holder" (interceptor). It runs automatically before every request
api.interceptors.request.use(
  config => {
    // 3. Check if we have a saved "entry card" (token)
    const token = localStorage.getItem('token');
    if (token) {
      // 4. If yes, add it to the request header
      config.headers['x-auth-token'] = token;
    }
    return config; // 5. Release the updated request on its way
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;

