import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">כניסה למערכת</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="email" 
            label="אימייל"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            type="password" 
            label="סיסמה"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
