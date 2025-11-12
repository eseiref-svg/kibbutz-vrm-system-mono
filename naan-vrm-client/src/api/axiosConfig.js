import axios from 'axios';

// 1. ניצור "מופע" מרכזי של axios עם כתובת השרת שלנו
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('🔗 API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL
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

