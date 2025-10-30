import axios from 'axios';

// Debug: Print environment variable
console.log('🔍 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('🌐 Using baseURL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// 1. ניצור "מופע" מרכזי של axios עם כתובת השרת שלנו
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// 2. זהו "מחזיק המפתחות". הוא יפעל אוטומטית לפני כל בקשה
api.interceptors.request.use(
  config => {
    // 3. הוא בודק אם יש לנו "כרטיס כניסה" שמור
    const token = localStorage.getItem('token');
    if (token) {
      // 4. אם כן, הוא מוסיף אותו לכותרת הבקשה
      config.headers['x-auth-token'] = token;
    }
    return config; // 5. הוא משחרר את הבקשה המעודכנת לדרכה
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;

