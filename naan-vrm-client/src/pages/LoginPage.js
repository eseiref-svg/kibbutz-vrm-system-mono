import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { validateEmail } from '../utils/validation';
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'אימייל הוא שדה חובה';
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.error;
      }
    }

    if (!password) {
      newErrors.password = 'סיסמה היא שדה חובה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post('/users/login', {
        email,
        password,
      });

      login(response.data.token);
      navigate('/');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'ההתחברות נכשלה. אנא נסה שוב.';
      console.error('ההתחברות נכשלה:', errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="flex justify-center mb-6">
          <img src="/favicon.png" alt="לוגו המערכת" className="h-16 w-auto object-contain hover:opacity-90 transition-opacity" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">כניסה למערכת</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="אימייל"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            required
          />
          <Input
            type="password"
            label="סיסמה"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            required
          />
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button
            type="submit"
            variant="primary"
            fullWidth
          >
            התחבר
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
