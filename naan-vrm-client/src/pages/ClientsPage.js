import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import ClientsTable from '../components/clients/ClientsTable';
import ClientSearch from '../components/clients/ClientSearch';
import ClientDetailsCard from '../components/clients/ClientDetailsCard';
import AddClientForm from '../components/clients/AddClientForm';
import { Button } from '@mui/material';

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchClients = (criteria = '', query = '') => {
    setLoading(true);
    api.get(`/clients/search`, {
      params: { criteria: criteria.trim(), query: query.trim() }
    })
      .then(response => {
        setClients(response.data);
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSearch = () => {
    fetchClients(searchCriteria, searchQuery);
  };

  const handleClientAdded = () => {
    fetchClients();
    setShowAddForm(false);
  };

  const handleDeleteClient = async (id) => {
    if (window.confirm(`האם אתה בטוח שברצונך להעביר לארכיון את לקוח מספר ${id}?`)) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
        alert('הלקוח הועבר לארכיון בהצלחה');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('הפעולה נכשלה.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800">ניהול לקוחות</h2>
        {!selectedClient && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 text-white hover:bg-green-600 font-bold py-2 px-4 rounded-lg"
          >
            {showAddForm ? 'הסתר טופס' : 'הוסף לקוח חדש'}
          </button>
        )}
      </div>

      {showAddForm && <AddClientForm onClientAdded={handleClientAdded} />}

      {selectedClient ? (
        <ClientDetailsCard 
          client={selectedClient}
          onBackToList={() => setSelectedClient(null)}
          onRefresh={fetchClients}
        />
      ) : (
        <>
          <ClientSearch 
            query={searchQuery}
            setQuery={setSearchQuery}
            criteria={searchCriteria}
            setCriteria={setSearchCriteria}
            onSearch={handleSearch}
          />
          <div className="mt-8">
            {loading ? (
              <p>טוען נתונים...</p>
            ) : (
              <ClientsTable 
                clients={clients}
                onDelete={handleDeleteClient}
                onRowClick={setSelectedClient}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ClientsPage;



