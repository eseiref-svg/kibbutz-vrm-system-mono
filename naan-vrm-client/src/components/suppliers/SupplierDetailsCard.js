import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { Rating } from '@mui/material';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ReviewList from '../shared/ReviewList';

function SupplierDetailsCard({ supplier, onBackToList, onEdit }) {
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  
  const fetchReviews = useCallback(() => {
    if (!supplier) return;
    setLoadingReviews(true);
    api.get(`/suppliers/${supplier.supplier_id}/reviews`)
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => console.error("Error fetching reviews:", error))
      .finally(() => setLoadingReviews(false));
  }, [supplier]);

  useEffect(() => {
    if (activeTab === 'performance') {
      fetchReviews();
    }
  }, [activeTab, fetchReviews]);

  const handleReviewSubmit = async () => {
    if (newRating === 0) {
      alert('אנא בחר דירוג (1-5 כוכבים).');
      return;
    }
    try {
      await api.post('/reviews', {
        supplier_id: supplier.supplier_id,
        rate: newRating,
        comment: newComment
      });
      setNewRating(0);
      setNewComment('');
      fetchReviews();
      alert('הדירוג נשלח בהצלחה!');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert('שליחת הדירוג נכשלה.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={onBackToList}>חזרה לרשימה</Button>
        <Button variant="primary" onClick={() => onEdit(supplier)}>ערוך פרטי ספק</Button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{supplier.name}</h2>
        <p className="text-gray-600">{supplier.field || 'לא שויך'}</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <strong className="text-gray-700">איש קשר:</strong> 
          <span className="mr-2">{supplier.poc_name || 'לא הוזן'}</span>
        </div>
        <div>
          <strong className="text-gray-700">טלפון:</strong> 
          <span className="mr-2">{supplier.poc_phone || 'לא הוזן'}</span>
        </div>
        <div className="md:col-span-2">
          <strong className="text-gray-700">אימייל:</strong> 
          <span className="mr-2">{supplier.poc_email || 'לא הוזן'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('details')}
          >
            פרטים
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'payment_history' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('payment_history')}
          >
            היסטוריית תשלומים
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'performance' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            ביצועים ודירוג
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">פרטי התקשרות</h3>
            <div className="space-y-2">
              <p><strong>איש קשר:</strong> {supplier.poc_name || 'לא הוזן'}</p>
              <p><strong>טלפון:</strong> {supplier.poc_phone || 'לא הוזן'}</p>
              <p><strong>אימייל:</strong> {supplier.poc_email || 'לא הוזן'}</p>
            </div>
          </div>
        )}
        
        {activeTab === 'payment_history' && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">היסטוריית תשלומים</h3>
            <p>יוצג בקרוב...</p>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Add Review Form */}
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">הוסף דירוג חדש</h3>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium">דירוג (כוכבים):</span>
                <Rating
                  name="new-rating"
                  value={newRating}
                  onChange={(event, newValue) => setNewRating(newValue)}
                />
              </div>
              <Input
                label="הערות נוספות (אופציונלי)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
              />
              <Button variant="primary" onClick={handleReviewSubmit}>שלח דירוג</Button>
            </div>

            {/* Reviews List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">היסטוריית דירוגים</h3>
              {loadingReviews ? (
                <p>טוען דירוגים...</p>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierDetailsCard;
