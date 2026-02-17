import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import CreateSaleForm from './CreateSaleForm';
import ClientSalesTable from './ClientSalesTable';
import Button from '../shared/Button';
import StandardDetailsCard from '../shared/StandardDetailsCard';
import StandardDataRow from '../shared/StandardDataRow';
import { formatPaymentTerms } from '../../utils/paymentTerms';
import { LuPhone, LuMail, LuPlus } from 'react-icons/lu';

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

  const isActive = client.is_active !== false;

  return (
    <StandardDetailsCard
      title={client.name}
      subtitle={
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} title={isActive ? 'פעיל' : 'לא פעיל'}></span>
          <span className="text-sm text-gray-500">#{client.client_number || '-'}</span>
        </div>
      }
      isActive={isActive}
      onBack={onBackToList}
      entityType="לקוח"

      // Restore standard buttons
      onEdit={onEdit}
      onStatusToggle={onStatusToggle}
      showStatus={false} // Keeping the dot in subtitle, so hiding text status if desired, or can revert to true. User didn't specify, but "Minimalist" usually liked the dot. Let's keep the dot for now.

      extraActions={
        <div className="flex items-center gap-2">
          {!showCreateSaleForm && (
            <Button
              variant="primary"
              onClick={() => setShowCreateSaleForm(true)}
              className="flex items-center gap-2 rounded-full px-4"
              size="sm"
            >
              <LuPlus size={16} />
              צור מכירה
            </Button>
          )}
          {showCreateSaleForm && (
            <Button
              variant="outline"
              onClick={() => setShowCreateSaleForm(false)}
              className="rounded-full"
              size="sm"
            >
              ביטול
            </Button>
          )}
        </div>
      }
    >

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">

        {/* Column 1: Contact - Reverted to StandardDataRow */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">פרטי קשר</h3>
          <div className="space-y-4">
            <StandardDataRow label="איש קשר" value={client.poc_name} />

            <StandardDataRow
              label="אימייל"
              value={client.poc_email ? (
                <a href={`mailto:${client.poc_email}`} className="hover:text-blue-600 transition-colors flex items-center gap-1.5 dir-ltr w-fit">
                  {client.poc_email} <LuMail size={14} className="text-gray-400" />
                </a>
              ) : '-'}
            />

            <StandardDataRow
              label="טלפון"
              value={client.poc_phone ? (
                <a href={`tel:${client.poc_phone}`} className="hover:text-blue-600 transition-colors flex items-center gap-1.5 dir-ltr w-fit">
                  {client.poc_phone} <LuPhone size={14} className="text-gray-400" />
                </a>
              ) : '-'}
            />
          </div>
        </div>

        {/* Column 2: Billing */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">כתובת וחיוב</h3>
          <div className="space-y-4">
            <StandardDataRow
              label="כתובת"
              value={`${client.city || ''}, ${client.street || ''}`}
            />
            <StandardDataRow
              label="תנאי תשלום"
              value={formatPaymentTerms(client.payment_terms)}
            />
            <StandardDataRow
              label="מספר לקוח"
              value={client.client_number || '-'}
            />
          </div>
        </div>
      </div>

      {showCreateSaleForm && (
        <div className="mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in-down">
          <CreateSaleForm
            clientId={client.client_id}
            clientName={client.name}
            defaultBranchId={null}
            onSaleCreated={handleSaleCreated}
            onCancel={() => setShowCreateSaleForm(false)}
          />
        </div>
      )}

      {/* Sales Table Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {user?.branch_business === false ? 'היסטוריית תשלומים' : 'פעילות אחרונה'}
          </h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">טוען נתונים...</div>
          ) : (
            <ClientSalesTable sales={sales} onRefresh={fetchSales} simpleMode={true} />
          )}
        </div>
      </div>

    </StandardDetailsCard>
  );
}

export default ClientDetailsCard;
