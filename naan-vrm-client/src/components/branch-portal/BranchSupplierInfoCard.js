import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { Rating } from '@mui/material';
import Button from '../shared/Button';
import Input from '../shared/Input';
import RatingSummary from '../shared/RatingSummary';
import ReviewList from '../shared/ReviewList';
import CreatePaymentRequestForm from './CreatePaymentRequestForm';

function BranchSupplierInfoCard({ supplier, onClear, branchId }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!supplier) {
    return (
      <div className="bg-yellow-100 p-4 mt-4 rounded-lg border border-yellow-200 text-center text-yellow-800">
        לא נמצא ספק התואם לחיפוש.
      </div>
    );
  }

  const fetchReviews = () => {
    if (!supplier) return;
    setLoadingReviews(true);
    api.get(`/suppliers/${supplier.supplier_id}/reviews`)
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => console.error("Error fetching reviews:", error))
      .finally(() => setLoadingReviews(false));
  };

  const handleReviewSubmit = async () => {
    if (newRating === 0) {
      alert('אנא בחר דירוג (1-5 כוכבים).');
      return;
    }
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReviews = () => {
    if (!showReviews) {
      fetchReviews();
    }
    setShowReviews(!showReviews);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">{supplier.name}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="success" onClick={() => setShowPaymentForm(true)}>צור דרישת תשלום</Button>
          <Button size="sm" variant="outline" onClick={onClear}>נקה</Button>
        </div>
      </div>

      {/* Supplier Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <strong className="text-gray-700">שם:</strong>
          <span className="mr-2">{supplier.name}</span>
        </div>
        <div>
          <strong className="text-gray-700">ח.פ./ע.מ.:</strong>
          <span className="mr-2">{supplier.supplier_id}</span>
        </div>
        <div>
          <strong className="text-gray-700">איש קשר:</strong>
          <span className="mr-2">{supplier.poc_name}</span>
        </div>
        <div>
          <strong className="text-gray-700">טלפון:</strong>
          <a href={`tel:${supplier.poc_phone}`} className="text-blue-600 hover:underline mr-2">
            {supplier.poc_phone}
          </a>
        </div>
        <div className="sm:col-span-2">
          <strong className="text-gray-700">אימייל:</strong>
          <a href={`mailto:${supplier.poc_email}`} className="text-blue-600 hover:underline mr-2">
            {supplier.poc_email}
          </a>
        </div>
      </div>

      {/* Rating Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">דירוג</h4>
        <RatingSummary
          average={parseFloat(supplier.average_rating)}
          totalReviews={supplier.total_reviews}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={toggleReviews}
          className="mt-3"
        >
          {showReviews ? 'צמצם דירוגים' : 'הרחב דירוגים'}
        </Button>
      </div>

      {/* Reviews Section */}
      {showReviews && (
        <div className="mt-6 border-t pt-6">
          {/* Add Review Form */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h4 className="text-lg font-semibold mb-4">הוסף דירוג חדש</h4>
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
            <Button
              variant="primary"
              onClick={handleReviewSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'שולח...' : 'שלח דירוג'}
            </Button>
          </div>

          {/* Reviews List */}
          <div>
            <h4 className="text-lg font-semibold mb-4">היסטוריית דירוגים</h4>
            {loadingReviews ? (
              <p>טוען דירוגים...</p>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </div>
        </div>
      )}

      {/* Payment Request Modal */}
      {showPaymentForm && (
        <CreatePaymentRequestForm
          open={showPaymentForm}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            setShowPaymentForm(false);
          }}
          supplier={supplier}
          branchId={branchId}
        />
      )}
    </div>
  );
}

export default BranchSupplierInfoCard;
