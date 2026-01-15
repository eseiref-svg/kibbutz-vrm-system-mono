import React from 'react';
import UnifiedSupplierForm from '../shared/UnifiedSupplierForm';

function RequestSupplierForm({ open, onClose, onSuccess, userId, branchId }) {
  return (
    <UnifiedSupplierForm
      open={open}
      onClose={onClose}
      onSubmit={(data) => {
        // UnifiedForm with branch_manager mode calls the API itself.
        // We just need to trigger the success callback when it finishes.
        if (onSuccess) onSuccess();
      }}
      mode="branch_manager"
      title="בקשה לספק חדש"
      submitLabel="שלח בקשה"
      extraPayload={{
        branch_id: branchId,
        requested_by_user_id: userId // Pass this just in case, though server usually takes from token
      }}
    />
  );
}

export default RequestSupplierForm;
