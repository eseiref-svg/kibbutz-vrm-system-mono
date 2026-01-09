import React, { useState, useEffect } from 'react';
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
    mode = 'treasurer', // 'treasurer' | 'coordinator'
    title,
    submitLabel = 'שמור'
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
        const requiredFields = [
            { value: formData.supplier_id, name: 'supplier_id', label: 'מספר ח.פ. ספק' },
            { value: formData.name, name: 'name', label: 'שם הספק' },
            { value: formData.poc_name, name: 'poc_name', label: 'שם איש קשר' },
            { value: formData.poc_phone, name: 'poc_phone', label: 'טלפון איש קשר' },
            { value: formData.city, name: 'city', label: 'עיר' },
            { value: formData.street, name: 'street', label: 'רחוב' },
            { value: formData.house_no, name: 'house_no', label: 'מספר בית' },
        ];

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

    const handleSubmit = () => {
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
            // Ensure specific field names match what backend expects if necessary
            // Backend expects 'street' or 'street_name'. form has 'street'
            street_name: formData.street
        };

        onSubmit(payload);
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title={title || (initialData ? 'עריכת ספק' : 'הוספת ספק חדש')}
            size="md"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>ביטול</Button>
                    <Button variant="success" onClick={handleSubmit}>{submitLabel}</Button>
                </>
            }
        >
            <div className="space-y-4">
                {serverError && <div className="text-red-500">{serverError}</div>}

                <Input
                    name="supplier_id"
                    label="מספר ח.פ. ספק"
                    value={formData.supplier_id}
                    onChange={handleChange}
                    required
                    helperText="עד 9 ספרות"
                    error={errors.supplier_id}
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
                        options={[
                            { value: 'immediate', label: 'מיידי' },
                            { value: 'plus_15', label: 'שוטף + 15' },
                            { value: 'plus_35', label: 'שוטף + 35' },
                            { value: 'plus_50', label: 'שוטף + 50' }
                        ]}
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
                    <h4 className="text-md font-semibold mb-2">כתובת</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            name="city"
                            label="עיר"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            error={errors.city}
                        />
                        <Input
                            name="street"
                            label="רחוב"
                            value={formData.street}
                            onChange={handleChange}
                            required
                            error={errors.street}
                        />
                        <Input
                            name="house_no"
                            label="מס' בית"
                            value={formData.house_no}
                            onChange={handleChange}
                            required
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
