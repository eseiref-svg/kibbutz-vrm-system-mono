import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';
import { validatePhoneNumber, validateEmail, validateRequired, validatePassword } from '../utils/validation';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const permissionMap = { 1: 'Admin', 2: 'גזבר', 3: 'הנהלת חשבונות', 4: 'מנהל ענף', 5: 'Derictrion' };

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(response => {
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setError('שגיאה בטעינת המשתמשים.');
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user => {
      if (searchCriteria === 'name') {
        const fullName = `${user.first_name} ${user.surname}`.toLowerCase();
        return fullName.includes(query);
      } else if (searchCriteria === 'email') {
        return user.email.toLowerCase().includes(query);
      }
      return false;
    });
    setFilteredUsers(filtered);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
    } else {
      setIsEditing(false);
      setCurrentUser({ first_name: '', surname: '', email: '', phone_no: '', password: '', permissions_id: 4, status: 'active' });
    }
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setError('');
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle number inputs specifically if needed, but for select it's usually string
    // We will convert permissions_id to int when saving or here if we want strict typing
    const newValue = name === 'permissions_id' ? parseInt(value, 10) : value;
    setCurrentUser({ ...currentUser, [name]: newValue });
  };

  const validateForm = () => {
    const errors = {};

    const requiredFields = [
      { value: currentUser.first_name, name: 'first_name', label: 'שם פרטי' },
      { value: currentUser.surname, name: 'surname', label: 'שם משפחה' }
    ];

    for (const field of requiredFields) {
      const validation = validateRequired(field.value, field.label);
      if (!validation.isValid) {
        errors[field.name] = validation.error;
      }
    }

    // Email validation
    const emailValidation = validateEmail(currentUser.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }

    // Phone validation
    const phoneValidation = validatePhoneNumber(currentUser.phone_no);
    if (!phoneValidation.isValid) {
      errors.phone_no = phoneValidation.error;
    }

    // Password validation (only for new users or if password is provided during edit)
    if (!isEditing || (currentUser.password && currentUser.password.trim())) {
      const passwordValidation = validatePassword(currentUser.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
      }
    }

    return errors;
  };

  const handleSubmit = async () => {
    // Validation check
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      // Remove hyphens from phone number before sending
      const userData = {
        ...currentUser,
        phone_no: (currentUser.phone_no || '').replace(/-/g, '')
      };

      if (isEditing) {
        await api.put(`/users/${currentUser.user_id}`, userData);
      } else {
        await api.post('/users/register', userData);
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || 'שמירת המשתמש נכשלה.');
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך להשבית משתמש זה?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error("Error deactivating user:", err);
        alert('השבתת המשתמש נכשלה.');
      }
    }
  };

  const handlePasswordReset = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך ליצור קישור לאיפוס סיסמה עבור משתמש זה?')) {
      try {
        const response = await api.post(`/users/${userId}/request-password-reset`);
        window.prompt("העתק את הקישור ושלח אותו למשתמש במייל:", response.data.resetUrl);
      } catch (err) {
        console.error("Error requesting password reset:", err);
        alert('יצירת קישור לאיפוס סיסמה נכשלה.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">ניהול משתמשים</h2>
        <Button variant="success" onClick={() => handleOpenModal()}>
          הוסף משתמש חדש
        </Button>
      </div>

      {loading && <p>טוען משתמשים...</p>}
      {error && !loading && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">חיפוש משתמשים</h3>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <Select
                value={searchCriteria}
                onChange={(e) => setSearchCriteria(e.target.value)}
                options={[
                  { value: 'name', label: 'לפי שם' },
                  { value: 'email', label: 'לפי אימייל' }
                ]}
                fullWidth={false}
                className="sm:w-40"
              />

              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchCriteria === 'name' ? 'הקלד שם משתמש...' : 'הקלד אימייל...'}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-grow"
                showClearButton={true}
                onClear={handleClearSearch}
              />

              <Button
                onClick={handleSearch}
                variant="primary"
                className="whitespace-nowrap sm:w-auto w-full"
              >
                חיפוש
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-right font-semibold">שם מלא</th>
                  <th className="py-2 px-3 text-right font-semibold">אימייל</th>
                  <th className="py-2 px-3 text-right font-semibold">תפקיד</th>
                  <th className="py-2 px-3 text-right font-semibold">סטטוס</th>
                  <th className="py-2 px-3 text-right font-semibold">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.user_id} className="border-b">
                    <td className="py-2 px-3">{user.first_name} {user.surname}</td>
                    <td className="py-2 px-3">{user.email}</td>
                    <td className="py-2 px-3">{permissionMap[user.permissions_id] || user.permissions_id}</td>
                    <td className="py-2 px-3">{user.status === 'active' ? 'פעיל' : 'לא פעיל'}</td>
                    <td className="py-2 px-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(user)}>ערוך</Button>
                        {user.status === 'active' &&
                          <>
                            <Button size="sm" variant="danger" onClick={() => handleDeactivate(user.user_id)}>השבת</Button>
                            <Button size="sm" variant="secondary" onClick={() => handlePasswordReset(user.user_id)}>שלח איפוס</Button>
                          </>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>ביטול</Button>
            <Button variant="primary" onClick={handleSubmit}>שמור</Button>
          </>
        }
      >
        {currentUser && (
          <div className="space-y-4">
            <Input
              name="first_name"
              label="שם פרטי"
              value={currentUser.first_name || ''}
              onChange={handleChange}
              required
              error={validationErrors.first_name}
            />
            <Input
              name="surname"
              label="שם משפחה"
              value={currentUser.surname || ''}
              onChange={handleChange}
              required
              error={validationErrors.surname}
            />
            <Input
              name="email"
              label="אימייל"
              type="email"
              value={currentUser.email || ''}
              onChange={handleChange}
              required
              disabled={isEditing}
              error={validationErrors.email}
            />
            <Input
              name="phone_no"
              label="טלפון"
              value={currentUser.phone_no || ''}
              onChange={handleChange}
              required
              error={validationErrors.phone_no}
              helperText="נייד (10 ספרות) או נייח (9 ספרות). ניתן להשתמש במקפים."
            />
            {!isEditing && (
              <Input
                name="password"
                label="סיסמה"
                type="password"
                value={currentUser.password || ''}
                onChange={handleChange}
                required
                error={validationErrors.password}
              />
            )}
            <Select
              name="permissions_id"
              label="תפקיד"
              value={currentUser.permissions_id || 4}
              onChange={handleChange}
              options={Object.entries(permissionMap).map(([id, name]) => ({
                value: parseInt(id, 10),
                label: name
              }))}
            />
            {isEditing && (
              <Select
                name="status"
                label="סטטוס"
                value={currentUser.status || 'active'}
                onChange={handleChange}
                options={[
                  { value: 'active', label: 'פעיל' },
                  { value: 'inactive', label: 'לא פעיל' }
                ]}
              />
            )}
          </div>
        )}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </Modal>
    </div>
  );
}

export default UserManagementPage;
