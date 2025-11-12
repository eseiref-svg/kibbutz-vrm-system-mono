import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import CreateSaleForm from './CreateSaleForm';
import ClientSalesTable from './ClientSalesTable';

function ClientDetailsCard({ client, onBackToList, onRefresh }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);

  useEffect(() => {
    fetchSales();
  }, [client.client_id]);

  const fetchSales = async () => {
    try {
      const response = await api.get(`/clients/${client.client_id}/sales`);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <button 
        onClick={onBackToList}
        className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
      >
        ← חזור לרשימת לקוחות
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{client.name}</h2>
            <p className="text-gray-600">מספר לקוח: {client.client_number || client.client_id}</p>
          </div>
          <div className="flex gap-3">
            {client.poc_phone && (
              <button 
                onClick={handleCallClient}
                className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-4 rounded-lg"
              >
                📞 התקשר
              </button>
            )}
            {client.poc_email && (
              <button 
                onClick={handleEmailClient}
                className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-4 rounded-lg"
              >
                ✉️ שלח אימייל
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">פרטי איש קשר</h3>
            <div className="space-y-2">
              <p><span className="font-semibold">שם:</span> {client.poc_name}</p>
              <p><span className="font-semibold">טלפון:</span> {client.poc_phone || 'לא צוין'}</p>
              <p><span className="font-semibold">אימייל:</span> {client.poc_email || 'לא צוין'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">כתובת</h3>
            <div className="space-y-2">
              <p><span className="font-semibold">עיר:</span> {client.city || 'לא צוין'}</p>
              <p><span className="font-semibold">רחוב:</span> {client.street || 'לא צוין'}</p>
              <p><span className="font-semibold">מיקוד:</span> {client.postal_code || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button 
            onClick={() => setShowCreateSaleForm(!showCreateSaleForm)}
            className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-6 rounded-lg"
          >
            {showCreateSaleForm ? 'ביטול' : '+ יצירת דרישת תשלום חדשה'}
          </button>
        </div>
      </div>

      {showCreateSaleForm && (
        <CreateSaleForm 
          clientId={client.client_id}
          clientName={client.name}
          onSaleCreated={handleSaleCreated}
          onCancel={() => setShowCreateSaleForm(false)}
        />
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">היסטוריית מכירות ותשלומים</h3>
        {loading ? (
          <p>טוען נתונים...</p>
        ) : (
          <ClientSalesTable sales={sales} onRefresh={fetchSales} />
        )}
      </div>
    </div>
  );
}

export default ClientDetailsCard;



