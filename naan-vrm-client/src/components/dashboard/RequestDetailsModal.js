import React from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

function RequestDetailsModal({ isOpen, onClose, data, type, onApprove, onReject }) {
    if (!data) return null;

    const isSupplier = type === 'supplier';
    const title = isSupplier ? 'פרטי בקשת ספק' : 'פרטי בקשת לקוח';

    // Helper to render a field row
    const Field = ({ label, value }) => (
        <div className="mb-3 border-b border-gray-100 pb-2 last:border-0">
            <span className="font-semibold text-gray-700 block mb-1">{label}:</span>
            <span className="text-gray-900 block break-words">{value || '-'}</span>
        </div>
    );

    // Safe date formatting
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const d = new Date(dateString);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear();
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (e) {
            console.error('Invalid date:', dateString);
            return dateString;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>סגור</Button>
                    <div className="flex gap-2 mr-auto">
                        <Button variant="danger" onClick={() => onReject(isSupplier ? data.supplier_req_id : data.client_req_id)}>דחה בקשה</Button>
                        <Button variant="success" onClick={() => onApprove(data)}>אשר בקשה</Button>
                    </div>
                </>
            }
        >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                    <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">פרטי הבקשה</h4>
                    <Field label="תאריך בקשה" value={formatDate(data.created_at)} />
                    <Field label="הוגש על ידי" value={data.requested_by_name || data.requested_by} />
                    <Field label="ענף" value={data.branch_name} />
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                        {isSupplier ? 'פרטי הספק' : 'פרטי הלקוח'}
                    </h4>

                    {isSupplier ? (
                        <>
                            <Field label="שם הספק" value={data.supplier_name} />
                            <Field label="ח.פ. / עוסק מורשה" value={data.requested_supplier_id} />
                            <Field label="תחום" value={data.supplier_field_id} />
                            <Field label="איש קשר" value={data.poc_name} />
                            <Field label="טלפון" value={data.poc_phone} />
                            <Field label="אימייל" value={data.poc_email} />
                            <Field label="תיאור/הערות" value={data.description} />
                        </>
                    ) : (
                        <>
                            <Field label="שם הלקוח" value={data.client_name} />
                            {data.client_id && <Field label="מספר לקוח קיים" value={data.client_id} />}
                            <Field label="איש קשר" value={data.poc_name} />
                            <Field label="טלפון" value={data.poc_phone} />
                            <Field label="אימייל" value={data.poc_email} />
                            <Field label="עיר" value={data.city} />
                            <Field label="רחוב" value={data.street_name} />
                            <Field label="מספר בית" value={data.house_no} />
                            <Field label="מיקוד" value={data.zip_code} />
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

export default RequestDetailsModal;
