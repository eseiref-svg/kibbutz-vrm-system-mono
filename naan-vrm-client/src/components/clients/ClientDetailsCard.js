import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import CreateSaleForm from './CreateSaleForm';
import ClientSalesTable from './ClientSalesTable';
import Button from '../shared/Button';
import StandardDetailsCard from '../shared/StandardDetailsCard';
import StandardDataRow from '../shared/StandardDataRow';
import { formatPaymentTerms } from '../../utils/paymentTerms';
import { LuPhone, LuMail } from 'react-icons/lu';

function ClientDetailsCard({ client, onBackToList, onRefresh, onEdit, onStatusToggle }) {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      const response = await api.get(`/clients/${client.client_id}/sales`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  }, [client.client_id]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleSaleCreated = () => {
    fetchSales();
    setShowCreateSaleForm(false);
  };

  const handleCallClient = () => {
    if (client.poc_phone) {
      window.location.href = `tel:${client.poc_phone}`;
    }
  };

  const handleEmailClient = () => {
    if (client.poc_email) {
      window.location.href = `mailto:${client.poc_email}`;
    }
  };

  const isActive = client.is_active !== false;

  return (
    <StandardDetailsCard
      title={client.name}
      subtitle={`מספר לקוח: ${client.client_number || '-'}`}
      isActive={isActive}
      onBack={onBackToList}
      onEdit={onEdit}
      entityType="לקוח"
      onStatusToggle={onStatusToggle}
      extraActions={
        <Button
          variant={showCreateSaleForm ? "outline" : "primary"}
          onClick={() => setShowCreateSaleForm(!showCreateSaleForm)}
        >
          {showCreateSaleForm ? 'ביטול יצירה' : 'צור דרישת תשלום'}
        </Button>
      }
    >
      <div className="flex gap-3 mb-6">
        {client.poc_phone && (
          <button
            onClick={handleCallClient}
            className="bg-green-100 text-green-700 hover:bg-green-200 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            title="התקשר"
          >
            <LuPhone size={18} /> התקשר
          </button>
        )}
        {client.poc_email && (
          <button
            onClick={handleEmailClient}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            title="שלח אימייל"
          >
            <LuMail size={18} /> שלח אימייל
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">פרטי איש קשר</h3>
          <div className="space-y-3">
            <StandardDataRow label="שם" value={client.poc_name} />
            <StandardDataRow label="טלפון" value={client.poc_phone || 'לא צוין'} />
            <StandardDataRow label="אימייל" value={client.poc_email || 'לא צוין'} />
          </div>
        </div>

        {/* Location Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">כתובת ותנאים</h3>
          <div className="space-y-3">
            <StandardDataRow
              label="כתובת"
              value={`${client.city || '-'}, ${client.street || '-'}`}
            />
            <StandardDataRow
              label="תנאי תשלום"
              value={formatPaymentTerms(client.payment_terms)}
            />
          </div>
        </div>
      </div>



      {showCreateSaleForm && (
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <CreateSaleForm
            clientId={client.client_id}
            clientName={client.name}
            defaultBranchId={null}
            onSaleCreated={handleSaleCreated}
            onCancel={() => setShowCreateSaleForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          {user?.branch_business === false ? 'היסטוריית ותשלומים' : 'היסטוריית מכירות ותשלומים'}
        </h3>
        {loading ? (
          <p className="text-gray-500">טוען נתונים...</p>
        ) : (
          <ClientSalesTable sales={sales} onRefresh={fetchSales} />
        )}
      </div>

    </StandardDetailsCard>
  );
}

export default ClientDetailsCard;
