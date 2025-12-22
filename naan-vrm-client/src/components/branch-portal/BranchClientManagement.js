import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import CreateSaleForm from '../clients/CreateSaleForm';
import BranchClientSearch from './BranchClientSearch';
import ClientRequestForm from './ClientRequestForm';
import Button from '../shared/Button';

function BranchClientManagement({ branchId, onSaleCreated }) {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]); // Store all clients for search
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateSaleForm, setShowCreateSaleForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');

  const fetchClients = useCallback(async () => {
    if (!branchId) {
      setClients([]);
      setAllClients([]);
      return;
    }

    try {
      setError('');
      setLoading(true);
      // Fetch clients filtered by branch (only clients with sales for this branch)
      const response = await api.get('/clients/search', {
        params: { branchId }
      });
      const clientsData = response.data || [];
      setClients(clientsData);
      setAllClients(clientsData); // Store for search functionality
      console.log('Clients loaded:', clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('שגיאה בטעינת לקוחות: ' + (error.response?.data?.message || error.message));
      setClients([]);
      setAllClients([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all clients
      setClients(allClients);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/clients/search', {
        params: {
          branchId,
          criteria: searchCriteria,
          query: searchQuery.trim()
        }
      });
      setClients(response.data || []);
    } catch (error) {
      console.error('Error searching clients:', error);
      setError('שגיאה בחיפוש: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchCriteria('name');
    setClients(allClients);
  };

  const handleSaleCreated = () => {
    setShowCreateSaleForm(false);
    setSelectedClient(null);
    alert('דרישת תשלום נוצרה בהצלחה!');
    fetchClients(); // Refresh client list
    if (onSaleCreated) {
      onSaleCreated(); // Notify parent to refresh transactions widget
    }
  };

  const handleRequestSubmitted = () => {
    setShowRequestForm(false);
    alert('הבקשה נשלחה בהצלחה ותועבר לאישור הנהלת חשבונות.');
    fetchClients(); // Refresh to show newly approved clients (if any)
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="text-xl font-bold text-gray-800">
          ניהול לקוחות ודרישות תשלום
        </h3>
        <Button
          variant="success"
          onClick={() => setShowRequestForm(true)}
        >
          בקשה ללקוח חדש
        </Button>
      </div>

      {showRequestForm && (
        <ClientRequestForm
          open={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSubmitted}
          branchId={branchId}
        />
      )}

      {showCreateSaleForm && selectedClient ? (
        <CreateSaleForm
          clientId={selectedClient.client_id}
          clientName={selectedClient.name}
          defaultBranchId={branchId}
          onSaleCreated={handleSaleCreated}
          onCancel={() => {
            setShowCreateSaleForm(false);
            setSelectedClient(null);
          }}
        />
      ) : (
        <div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <BranchClientSearch
            query={searchQuery}
            setQuery={setSearchQuery}
            criteria={searchCriteria}
            setCriteria={setSearchCriteria}
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">טוען לקוחות...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery ? 'לא נמצאו לקוחות תואמים לחיפוש' : 'אין לקוחות במערכת'}
              </p>
              <p className="text-gray-500 text-sm">
                {!searchQuery && 'השתמש בטופס "הגש בקשה" כדי ליצור לקוח חדש או דרישת תשלום'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <div
                  key={client.client_id}
                  className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowCreateSaleForm(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-blue-700 text-lg">{client.name}</h4>
                    {client.client_number && (
                      <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded font-semibold">
                        {client.client_number}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">איש קשר:</span> {client.poc_name || 'לא צוין'}
                    </p>
                    {client.poc_phone && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">טלפון:</span> {client.poc_phone}
                      </p>
                    )}
                    {client.poc_email && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">אימייל:</span> {client.poc_email}
                      </p>
                    )}
                  </div>

                  <button className="mt-3 bg-green-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-green-600 w-full">
                    + צור דרישת תשלום
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BranchClientManagement;

