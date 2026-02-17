import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Rating } from '@mui/material';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ReviewList from '../shared/ReviewList';
import StandardDataRow from '../shared/StandardDataRow';
import CreatePaymentRequestForm from '../branch-portal/CreatePaymentRequestForm';
import SupplierPaymentHistory from './SupplierPaymentHistory';
import { FiArrowRight, FiMoreVertical, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function SupplierDetailsCard({ supplier, onBackToList, onEdit, onStatusToggle, mode = 'treasurer', branchId }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Load reviews on mount
  useEffect(() => {
    if (!supplier) return;
    setLoadingReviews(true);
    api.get(`/suppliers/${supplier.supplier_id}/reviews`)
      .then(response => {
        setReviews(response.data);
      })
      .catch(error => console.error("Error fetching reviews:", error))
      .finally(() => setLoadingReviews(false));
  }, [supplier]);

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
      // Reload reviews
      api.get(`/suppliers/${supplier.supplier_id}/reviews`).then(res => setReviews(res.data));
      alert('הדירוג נשלח בהצלחה!');
    } catch (err) {
      console.error("Error submitting review:", err);
      alert('שליחת הדירוג נכשלה.');
    }
  };

  const isActive = supplier.is_active !== false;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in relative">

      {/* 1. Minimalist Header */}
      <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {onBackToList && (
            <button onClick={onBackToList} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
              <FiArrowRight size={24} />
            </button>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
              {mode === 'treasurer' && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                  {isActive ? 'פעיל' : 'לא פעיל'}
                </span>
              )}
              {supplier.field && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-semibold rounded-full border border-gray-200">
                  {supplier.field}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Primary Action */}
          <Button variant="primary" onClick={() => setIsPaymentRequestOpen(true)} className="flex items-center gap-2 shadow-sm">
            <span>+</span> צור דרישת תשלום
          </Button>

          {/* Secondary Actions (Menu) - Only for Treasurer */}
          {mode === 'treasurer' && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiMoreVertical size={20} />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                    {onEdit && (
                      <button
                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        onClick={() => { setShowMenu(false); onEdit(supplier); }}
                      >
                        ערוך פרטי ספק
                      </button>
                    )}
                    {onStatusToggle && (
                      <button
                        className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${isActive ? 'text-red-600' : 'text-green-600'}`}
                        onClick={() => { setShowMenu(false); onStatusToggle(supplier); }}
                      >
                        {isActive ? 'הקפא ספק' : 'הפעל ספק'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Contextual Info Bar */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-6 items-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold">ח.פ:</span>
          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-800">{supplier.supplier_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">ענף:</span>
          <span>{supplier.field || 'כללי'}</span>
        </div>
        {supplier.poc_phone && (
          <a href={`tel:${supplier.poc_phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-800 transition-colors">
            <FiPhone size={14} />
            <span>{supplier.poc_phone}</span>
          </a>
        )}
        {supplier.poc_email && (
          <a href={`mailto:${supplier.poc_email}`} className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-800 transition-colors">
            <FiMail size={14} />
            <span>{supplier.poc_email}</span>
          </a>
        )}
        {supplier.city && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <FiMapPin size={14} />
            <span>{supplier.city}, {supplier.street_name}</span>
          </div>
        )}
      </div>

      {/* 3. Main Scrollable Content */}
      <div className="p-8 space-y-10 bg-gray-50/30">

        {/* Payment History Section */}
        {mode === 'treasurer' && (
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">היסטוריית תשלומים</h3>
            </div>
            <div className="p-4">
              <SupplierPaymentHistory supplier={supplier} />
            </div>
          </section>
        )}

        {/* Performance & Reviews Section */}
        <section>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            ביצועים ודירוג
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add Review */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">הוסף חוות דעת</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">דירוג:</span>
                  <Rating
                    name="new-rating"
                    value={newRating}
                    onChange={(event, newValue) => setNewRating(newValue)}
                  />
                </div>
                <Input
                  label="הערה (אופציונלי)"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="כתוב כמה מילים..."
                  multiline
                />
                <div className="flex justify-end mt-2">
                  <Button variant="primary" size="sm" onClick={handleReviewSubmit}>שלח דירוג</Button>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 max-h-[400px] overflow-y-auto">
              <h4 className="font-bold text-gray-800 mb-4 sticky top-0 bg-white pb-2 border-b z-10">היסטוריית דירוגים</h4>
              {loadingReviews ? (
                <div className="text-center py-8 text-gray-400">טוען...</div>
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Payment Request Modal */}
      <CreatePaymentRequestForm
        open={isPaymentRequestOpen}
        onClose={() => setIsPaymentRequestOpen(false)}
        supplier={supplier}
        branchId={branchId || (supplier && supplier.branch_id) || '1'}
        autoApprove={mode === 'treasurer'}
        onSuccess={() => {
          alert(mode === 'treasurer' ? 'הדרישה נוצרה ואושרה בהצלחה' : 'הדרישה נשלחה לאישור');
        }}
      />
    </div>
  );
}

export default SupplierDetailsCard;
