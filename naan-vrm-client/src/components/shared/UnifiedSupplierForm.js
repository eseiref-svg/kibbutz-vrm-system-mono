import React, { useState, useEffect } from 'react';
import { PAYMENT_TERMS_OPTIONS } from '../../utils/paymentTerms';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import { validatePhoneNumber, validateEmail, validateRequired } from '../../utils/validation';

function UnifiedSupplierForm({
    open,
    onClose,
    onSubmit,
    initialData = null,
    mode = 'treasurer', // 'treasurer' | 'branch_manager'
    title,
    submitLabel = 'שמור',
    extraPayload = {} // Additional data to send with the request (e.g. branch_id)
}) {
    const [formData, setFormData] = useState({
        supplier_id: '',
        name: '',
        poc_name: '',
        poc_email: '',
        poc_phone: '',
        street: '',
        house_no: '',
        city: '',
        zip_code: '',
        supplier_field_id: '',
        new_supplier_field: '',
        payment_terms: 'immediate'
    });

    const [supplierFields, setSupplierFields] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [newField, setNewField] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    // Fetch Supplier Fields
    useEffect(() => {
        if (open) {
            api.get('/supplier-fields')
                .then(response => {
                    setSupplierFields(response.data);
                })
                .catch(err => {
                    console.error("Failed to fetch supplier fields:", err);
                    setServerError("שגיאה בטעינת תחומי הספקים.");
                });
        }
    }, [open]);

    // Initialize Data
    useEffect(() => {
        if (open && initialData) {
            // Logic to determine initial field selection
            let initFieldId = initialData.supplier_field_id || '';
            let initNewField = initialData.new_supplier_field || '';

            // Handle case where field might be object or ID
            if (typeof initFieldId === 'object') {
                initFieldId = initFieldId.supplier_field_id;
            }

            // If we have a new field string but no ID (or ID is null), set mode to 'new'
            if (initNewField && !initFieldId) {
                setSelectedField('new');
                setNewField(initNewField);
            } else {
                setSelectedField(initFieldId);
                setNewField('');
            }

            setFormData({
                supplier_id: initialData.supplier_id || initialData.requested_supplier_id || '',
                name: initialData.name || initialData.supplier_name || '',
                poc_name: initialData.poc_name || '',
                poc_email: initialData.poc_email || '',
                poc_phone: initialData.poc_phone || '',
                street: initialData.street || initialData.street_name || '',
                house_no: initialData.house_no || '',
                city: initialData.city || '',
                zip_code: initialData.zip_code || '',
                supplier_field_id: initFieldId,
                new_supplier_field: initNewField,
                payment_terms: initialData.payment_terms || 'immediate'
            });
        } else if (open && !initialData) {
            // Reset
            setFormData({
                supplier_id: '',
                name: '',
                poc_name: '',
                poc_email: '',
                poc_phone: '',
                street: '',
                house_no: '',
                city: '',
                zip_code: '',
                supplier_field_id: '',
                new_supplier_field: '',
                payment_terms: 'immediate'
            });
            setSelectedField('');
            setNewField('');
            setErrors({});
            setServerError('');
        }
    }, [open, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleFieldChange = (e) => {
        setSelectedField(e.target.value);
        if (errors.selectedField) {
            setErrors({ ...errors, selectedField: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const isTreasurer = mode === 'treasurer';

        const requiredFields = [
            { value: formData.supplier_id, name: 'supplier_id', label: 'מספר ח.פ. ספק' },
            { value: formData.name, name: 'name', label: 'שם הספק' },
            { value: formData.poc_name, name: 'poc_name', label: 'שם איש קשר' },
            { value: formData.poc_phone, name: 'poc_phone', label: 'טלפון איש קשר' },
        ];

        // Address fields are optional for branch manager
        if (isTreasurer) {
            requiredFields.push(
                { value: formData.city, name: 'city', label: 'עיר' },
                { value: formData.street, name: 'street', label: 'רחוב' },
                { value: formData.house_no, name: 'house_no', label: 'מספר בית' }
            );
        }

        if (!selectedField) {
            newErrors.selectedField = 'תחום הספק הוא שדה חובה';
        }
        if (selectedField === 'new' && !newField) {
            newErrors.new_field = 'שם התחום החדש הוא שדה חובה';
        }

        for (const field of requiredFields) {
            const validation = validateRequired(field.value, field.label);
            if (!validation.isValid) {
                newErrors[field.name] = validation.error;
            }
        }

        const phoneValidation = validatePhoneNumber(formData.poc_phone);
        if (!phoneValidation.isValid) newErrors.poc_phone = phoneValidation.error;

        if (formData.poc_email) {
            const emailValidation = validateEmail(formData.poc_email);
            if (!emailValidation.isValid) newErrors.poc_email = emailValidation.error;
        }

        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Prepare Payload
        const payload = {
            ...formData,
            supplier_field_id: selectedField === 'new' ? null : selectedField,
            new_supplier_field: selectedField === 'new' ? newField : null,
            street_name: formData.street
        };

        try {
            if (mode === 'branch_manager') {
                // Handle different field names for request API if needed
                await api.post('/supplier-requests', {
                    ...payload,
                    ...extraPayload, // Merge extra payload (e.g. branch_id)
                    supplier_name: payload.name, // Request API expects supplier_name
                    // Ensure we don't send nulls where empty strings are expected or vice-versa
                });
                if (onSubmit) onSubmit(); // Notify parent
            } else {
                // Treasurer mode - handled by parent typically, but we can do it here or pass payload
                // If parent provides onSubmit, we pass payload. If parent expects us to save, we save.
                // Reusing original logic: parent (SuppliersPage.js) handles submit usually.
                // But wait, the original passed 'data' to on submit.
                await onSubmit(payload);
            }
            onClose();
        } catch (err) {
            console.error("Submit Error:", err);
            setServerError(err.response?.data?.message || err.message || "שגיאה בשמירת הטופס");
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={title || (initialData ? 'עריכת ספק' : (mode === 'branch_manager' ? 'בקשה להוספת ספק' : 'הוספת ספק חדש'))}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>ביטול</Button>
                    <Button variant="success" onClick={handleSubmit}>{submitLabel}</Button>
                </>
            }
        >
            <div className="space-y-4">
                {serverError && <div className="text-red-500 mb-4 bg-red-50 p-2 rounded">{serverError}</div>}

                <Input
                    name="supplier_id"
                    label="מספר ח.פ. ספק"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    required
                    helperText="עד 9 ספרות"
                    error={errors.supplier_id}
                    disabled={mode === 'treasurer' && initialData && !initialData.supplier_req_id} // Disable ID edit ONLY for existing supplier (not requests)
                />

                <Input
                    name="name"
                    label="שם הספק"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={errors.name}
                />

                {/* Domain Selection */}
                <Select
                    label="תחום הספק"
                    value={selectedField}
                    onChange={handleFieldChange}
                    options={[
                        { value: 'new', label: 'אחר (תחום חדש)' },
                        ...supplierFields.map(field => ({
                            value: field.supplier_field_id,
                            label: field.field
                        }))
                    ]}
                    required
                    error={errors.selectedField}
                />

                {selectedField === 'new' && (
                    <Input
                        name="new_field"
                        label="שם התחום החדש"
                        value={newField}
                        onChange={(e) => setNewField(e.target.value)}
                        required
                        error={errors.new_field}
                    />
                )}

                {/* Payment Terms - Treasurer Only */}
                {mode === 'treasurer' && (
                    <Select
                        name="payment_terms"
                        label="תנאי תשלום"
                        value={formData.payment_terms}
                        onChange={handleChange}
                        options={PAYMENT_TERMS_OPTIONS}
                        required
                    />
                )}

                <Input
                    name="poc_name"
                    label="שם איש קשר"
                    value={formData.poc_name}
                    onChange={handleChange}
                    required
                    error={errors.poc_name}
                />

                <Input
                    name="poc_phone"
                    label="טלפון איש קשר"
                    value={formData.poc_phone}
                    onChange={handleChange}
                    required
                    helperText="נייד (10 ספרות) או נייח (9 ספרות)"
                    error={errors.poc_phone}
                />

                <Input
                    name="poc_email"
                    label="אימייל איש קשר"
                    type="email"
                    value={formData.poc_email}
                    onChange={handleChange}
                    error={errors.poc_email}
                />

                <div className="border-t pt-2 mt-2">
                    <h4 className="text-md font-semibold mb-2">כתובת {mode === 'branch_manager' && '(אופציונלי)'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            name="city"
                            label="עיר"
                            value={formData.city}
                            onChange={handleChange}
                            required={mode === 'treasurer'}
                            error={errors.city}
                        />
                        <Input
                            name="street"
                            label="רחוב"
                            value={formData.street}
                            onChange={handleChange}
                            required={mode === 'treasurer'}
                            error={errors.street}
                        />
                        <Input
                            name="house_no"
                            label="מס' בית"
                            value={formData.house_no}
                            onChange={handleChange}
                            required={mode === 'treasurer'}
                            error={errors.house_no}
                        />
                        <Input
                            name="zip_code"
                            label="מיקוד"
                            value={formData.zip_code}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default UnifiedSupplierForm;
