import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { Rating } from '@mui/material';
import Button from '../shared/Button';
import Input from '../shared/Input';
import ReviewList from '../shared/ReviewList';
import StandardDetailsCard from '../shared/StandardDetailsCard';
import StandardDataRow from '../shared/StandardDataRow';
import CreatePaymentRequestForm from '../branch-portal/CreatePaymentRequestForm';
import { LuCreditCard } from 'react-icons/lu';

function SupplierDetailsCard({ supplier, onBackToList, onEdit, onStatusToggle, mode = 'treasurer', branchId }) {
  const [activeTab, setActiveTab] = useState('details');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);

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

  const isActive = supplier.is_active !== false;

  // Determine which tabs to show based on functionality
  // For branch_manager, hide payment history.
  const tabs = [
    { id: 'details', label: 'פרטים נוספים' },
    { id: 'performance', label: 'ביצועים ודירוג' }
  ];

  if (mode === 'treasurer') {
    tabs.splice(1, 0, { id: 'payment_history', label: 'היסטוריית תשלומים' });
  }

  return (
    <>
      <StandardDetailsCard
        title={supplier.name}
        subtitle={
          <div className="flex items-center gap-2">
            {mode === 'treasurer' && ( // Show status only for Treasurer
              isActive ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">פעיל</span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">לא פעיל</span>
              )
            )}
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full font-medium">
              {supplier.field || 'לא שויך'}
            </span>
          </div>
        }
        isActive={mode === 'treasurer' ? isActive : true} // Always show "active" color logic or override? StandardDetailsCard uses isActive for border color. Let's keep it true or based on actual status but hide the *text* indicator above if needed. Using isActive from props affects visual "ban" look. Branch manager might want to see if banned? User said: "remove the 'Active' status indicator below the supplier's name." -> Done in subtitle.

        onBack={onBackToList}
        // Only pass onEdit/onStatusToggle if treasurer
        onEdit={mode === 'treasurer' ? () => onEdit(supplier) : undefined}
        onStatusToggle={mode === 'treasurer' ? () => onStatusToggle(supplier) : undefined}
        entityType="ספק"

        // Inject Custom Action Button
        extraActions={
          <Button
            variant="primary"
            onClick={() => setIsPaymentRequestOpen(true)}
          >
            צור דרישת תשלום
          </Button>
        }
        showStatus={false}
      >
        {/* Basic Info Header in Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
          <StandardDataRow label="ח.פ." value={supplier.supplier_id} />
          <StandardDataRow label="איש קשר" value={supplier.poc_name || 'לא הוזן'} />
          <StandardDataRow label="טלפון" value={supplier.poc_phone || 'לא הוזן'} />
          <StandardDataRow label="אימייל" value={supplier.poc_email || 'לא הוזן'} />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 min-h-[200px]">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-blue-200 pb-2">כתובת ומיקום</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StandardDataRow label="עיר" value={supplier.city || 'לא הוזן'} />
                <StandardDataRow label="רחוב" value={`${supplier.street_name || 'לא הוזן'} ${supplier.house_no || ''}`} />
                <StandardDataRow label="מיקוד" value={supplier.zip_code || 'לא הוזן'} />
              </div>
            </div>
          )}

          {activeTab === 'payment_history' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">היסטוריית תשלומים</h3>
              <p className="text-gray-500 italic">יוצג בקרוב...</p>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              {/* Add Review Form */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-800">הוסף דירוג חדש</h3>

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
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleReviewSubmit}>שלח דירוג</Button>
                </div>
              </div>

              {/* Reviews List */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">היסטוריית דירוגים</h3>
                {loadingReviews ? (
                  <p>טוען דירוגים...</p>
                ) : (
                  <ReviewList reviews={reviews} />
                )}
              </div>
            </div>
          )}
        </div>
      </StandardDetailsCard>

      {/* Payment Request Modal */}
      <CreatePaymentRequestForm
        open={isPaymentRequestOpen}
        onClose={() => setIsPaymentRequestOpen(false)}
        supplier={supplier}
        branchId={branchId || (supplier && supplier.branch_id) || '1'} // Default to 1 if no context (e.g. treasurer), or pass context props
        // Note: For Treasurer, branchId 1 (Community) is often default for general expenses, or they should select. 
        // CreatePaymentRequestForm is built for Branch Portal where branchId is fixed. 
        // We might need to handle branch selection for Treasurer later. 
        // For now, passing '1' (Kibbutz) as fallback logic for Treasurer if not provided.
        autoApprove={mode === 'treasurer'}
        onSuccess={() => {
          alert(mode === 'treasurer' ? 'הדרישה נוצרה ואושרה בהצלחה' : 'הדרישה נשלחה לאישור');
          // Refresh logic if needed
        }}
      />
    </>
  );
}

export default SupplierDetailsCard;
