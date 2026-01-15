import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ClientsTable from '../components/clients/ClientsTable';
import ClientSearch from '../components/clients/ClientSearch';
import ClientDetailsCard from '../components/clients/ClientDetailsCard';
import AddClientForm from '../components/clients/AddClientForm';
import Button from '../components/shared/Button';

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('name');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [limit] = useState(20);

  const fetchClients = useCallback((page = 1) => {
    setLoading(true);
    // Prepare params
    const params = {
      page: page,
      limit: limit,
      status: 'all' // Fetch all to show active/inactive status in table? 
      // Actually user soft delete usually means "Gone from default view".
      // But if we want to "Activate" them back, we need to see them.
      // For now, let's fetch 'all' so we can see inactive ones to reactivate, 
      // OR we add a filter "Show Inactive". 
      // Given the "Status" column request, I assume they want to see all.
      // Let's default to 'all' so the status column makes sense.
      // If the list is huge, maybe default 'active' is better.
      // Let's stick to 'all' for now as requested by "minimalist toggle".
    };

    if (searchQuery) {
      params.query = searchQuery.trim();
      params.criteria = searchCriteria;
    }

    api.get(`/clients/search`, { params })
      .then(response => {
        // Handle new response structure { data, total, page, limit } or old array
        if (response.data.data) {
          setClients(response.data.data);
          setTotalPages(Math.ceil(response.data.total / limit));
        } else {
          // Fallback if backend not fully updated or returns array
          setClients(response.data);
          setTotalPages(1);
        }
        setCurrentPage(page);
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [limit, searchQuery, searchCriteria]);

  useEffect(() => {
    fetchClients(1);
  }, [fetchClients]); // Re-fetch when search changes effectively

  const handleSearch = () => {
    setCurrentPage(1);
    fetchClients(1);
  };

  const handleClientFormSuccess = async () => {
    await fetchClients(currentPage);

    // If we are viewing a specific client (details view) and we just edited them, 
    // we need to refresh the selectedClient state to show changes immediately.
    if (selectedClient && editingClient && editingClient.client_id === selectedClient.client_id) {
      try {
        const response = await api.get(`/clients/${selectedClient.client_id}`);
        setSelectedClient(response.data);
      } catch (error) {
        console.error("Failed to refresh selected client", error);
      }
    }

    setShowAddForm(false);
    setEditingClient(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowAddForm(true);
  };

  const handleToggleStatus = async (client) => {
    const newStatus = client.is_active === false; // Toggle
    const actionName = newStatus ? 'להפעיל מחדש' : 'להשבית';
    if (window.confirm(`האם אתה בטוח שברצונך ${actionName} את הלקוח ${client.name}?`)) {
      try {
        // Must send full payload because PUT expects all fields
        // Map fields correctly for backend helper
        const payload = {
          ...client,
          is_active: newStatus,
          street_name: client.street_name, // Ensure these map correctly from search result
          zip_code: client.zip_code
        };
        await api.put(`/clients/${client.client_id}`, payload);
        // Optimistic update or refetch
        fetchClients(currentPage);
      } catch (error) {
        console.error('Error updating status:', error);
        alert('הפעולה נכשלה.');
      }
    }
  };

  const handleExportToExcel = async () => {
    try {
      // Fetch ALL clients for export (no pagination)
      const response = await api.get('/clients/search', {
        params: { status: 'all', limit: 10000 } // High limit to get all
      });

      const dataToExport = (response.data.data || response.data).map(c => ({
        'מזהה לקוח': c.client_number,
        'שם לקוח': c.name,
        'איש קשר': c.poc_name,
        'טלפון': c.poc_phone,
        'אימייל': c.poc_email,
        'עיר': c.city,
        'רחוב': c.street_name,
        'סטטוס': c.is_active === false ? 'לא פעיל' : 'פעיל',
        'תנאי תשלום': c.payment_terms || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
      console.error('Export failed:', error);
      alert('ייצוא לאקסל נכשל');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">ניהול לקוחות</h2>
        <div className="flex gap-2 w-full md:w-auto">
          {!selectedClient && !showAddForm && (
            <Button
              variant="success"
              onClick={handleExportToExcel}
              className="flex-1 md:flex-none"
            >
              ייצוא לאקסל
            </Button>
          )}
          {!selectedClient && (
            <Button
              variant={showAddForm ? 'secondary' : 'primary'}
              onClick={() => {
                setEditingClient(null);
                setShowAddForm(!showAddForm);
              }}
              className="flex-1 md:flex-none"
            >
              {showAddForm ? 'ביטול' : 'הוסף לקוח חדש +'}
            </Button>
          )}
        </div>
      </div>

      {showAddForm ? (
        <AddClientForm
          onClientAdded={handleClientFormSuccess}
          initialData={editingClient}
          onCancel={() => {
            setShowAddForm(false);
            setEditingClient(null);
          }}
        />
      ) : selectedClient ? (
        <ClientDetailsCard
          client={selectedClient}
          onBackToList={() => setSelectedClient(null)}
          onEdit={() => handleEditClient(selectedClient)}
          onStatusToggle={() => handleToggleStatus(selectedClient)}
        />
      ) : (
        <>
          {!showAddForm && (
            <>
              <ClientSearch
                query={searchQuery}
                setQuery={setSearchQuery}
                criteria={searchCriteria}
                setCriteria={setSearchCriteria}
                onSearch={handleSearch}
              />
              <div className="mt-8 overflow-x-auto">
                {loading ? (
                  <p className="text-center py-4">טוען נתונים...</p>
                ) : (
                  <ClientsTable
                    clients={clients}
                    onDeactivate={handleToggleStatus}
                    onEdit={handleEditClient}
                    onRowClick={setSelectedClient}
                    pagination={{ current: currentPage, totalPages: totalPages }}
                    onPageChange={(page) => fetchClients(page)}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ClientsPage;




