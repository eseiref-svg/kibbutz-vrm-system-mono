import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { validatePassword } from '../utils/validation';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error);
      return;
    }

    try {
      const response = await api.post('/users/reset-password', {
        token,
        newPassword: password,
      });
      setSuccess(response.data.message + ' הנך מועבר/ת לעמוד הכניסה בעוד מספר שניות.');
      setTimeout(() => {
        navigate('/login');
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'איפוס הסיסמה נכשל.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">איפוס סיסמה</h2>
        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="סיסמה חדשה"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="אימות סיסמה חדשה"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" fullWidth size="lg">
              אפס סיסמה
            </Button>
          </form>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
