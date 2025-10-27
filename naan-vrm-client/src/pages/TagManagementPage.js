import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';

function TagManagementPage() {
  const [supplierFields, setSupplierFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [currentTags, setCurrentTags] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldTags, setNewFieldTags] = useState('');
  const [validationError, setValidationError] = useState('');

  const fetchSupplierFields = () => {
    setLoading(true);
    api.get('/supplier-fields')
      .then(response => {
        setSupplierFields(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching supplier fields:", err);
        setError('שגיאה בטעינת תחומי הספקים.');
        setLoading(false);
      });
  };
  
  useEffect(() => {
    fetchSupplierFields();
  }, []);

  const handleEditClick = (field) => {
    setEditingFieldId(field.supplier_field_id);
    setCurrentTags(field.tags ? field.tags.join(', ') : '');
  };

  const handleSaveClick = async (fieldId) => {
    const tagsArray = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    try {
      await api.put(`/supplier-fields/${fieldId}`, {
        tags: tagsArray,
      });
      alert('התגים עודכנו בהצלחה!');
      setEditingFieldId(null);
      fetchSupplierFields(); 
    } catch (err) {
      console.error("Error updating tags:", err);
      alert('שגיאה בעדכון התגים.');
    }
  };

  const handleCancelClick = () => {
    setEditingFieldId(null);
    setCurrentTags('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewFieldName('');
    setNewFieldTags('');
    setValidationError('');
  };

  const handleCreateField = async () => {
    // אימות
    if (!newFieldName.trim()) {
      setValidationError('שם התחום הוא שדה חובה');
      return;
    }
    
    const tagsArray = newFieldTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');
    
    try {
      await api.post('/supplier-fields', {
        field: newFieldName.trim(),
        tags: tagsArray
      });
      
      alert('תחום חדש נוסף בהצלחה!');
      handleCloseModal();
      fetchSupplierFields();
    } catch (err) {
      console.error("Error creating field:", err);
      setValidationError(
        err.response?.data?.message || 'שגיאה בהוספת התחום'
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">
          ניהול תחומי ספקים
        </h2>
        <Button variant="success" onClick={() => setIsModalOpen(true)}>
          הוסף תחום ספק חדש
        </Button>
      </div>

      {loading && <p>טוען נתונים...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="space-y-4">
            {supplierFields.map(field => (
              <div key={field.supplier_field_id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">{field.field}</h3>
                {editingFieldId === field.supplier_field_id ? (
                  <div className="mt-2">
                    <textarea
                      value={currentTags}
                      onChange={(e) => setCurrentTags(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="הזן תגים מופרדים בפסיק (לדוגמה: אוכל, שתיה, בירה)"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm"
                        variant="primary"
                        onClick={() => handleSaveClick(field.supplier_field_id)}
                      >
                        שמור
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={handleCancelClick}
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-gray-600">
                      <strong>תגים:</strong> {field.tags && field.tags.length > 0 ? field.tags.join(', ') : 'אין תגים'}
                    </p>
                    <button 
                      onClick={() => handleEditClick(field)}
                      className="text-blue-600 hover:underline mt-2 text-sm font-medium"
                    >
                      ערוך תגים
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title="הוספת תחום ספקים חדש"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>ביטול</Button>
            <Button variant="primary" onClick={handleCreateField}>שמור</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="שם התחום" 
            value={newFieldName} 
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="לדוגמה: אלקטרוניקה"
            required
            error={validationError}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תגים (אופציונלי)
            </label>
            <textarea
              value={newFieldTags}
              onChange={(e) => setNewFieldTags(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="הזן תגים מופרדים בפסיק (לדוגמה: מחשבים, טלפונים)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TagManagementPage;
