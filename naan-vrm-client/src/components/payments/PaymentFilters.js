import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import Select from '../shared/Select';


const PaymentFilters = ({ onFilterChange }) => {
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    branchId: 'all',
    type: 'all',
  });

  const fetchBranches = useCallback(async () => {
    try {
      const response = await api.get('/branches/active');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      branchId: 'all',
      type: 'all',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">סינון תשלומים</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          איפוס סינונים
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filter by branch */}
        <div>
          <Select
            label="ענף"
            value={filters.branchId}
            onChange={(e) => handleFilterChange('branchId', e.target.value)}
            placeholder=""
            options={branches.length > 0 ? [
              { value: 'all', label: 'הכל' },
              ...branches.map(branch => ({ value: branch.branch_id, label: branch.name }))
            ] : [{ value: 'all', label: `טוען ענפים... (${branches.length})` }]}
          />
        </div>

        {/* Filter by transaction type */}
        <div>
          <Select
            label="סוג עסקה"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            placeholder=""
            options={[
              { value: 'all', label: 'הכל' },
              { value: 'payment', label: 'תשלום לספקים' },
              { value: 'sale', label: 'גביה מלקוחות' }
            ]}
          />
        </div>
      </div>

      {/* Active filter indicator */}
      {(filters.branchId !== 'all' || filters.type !== 'all') && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <span>סינון פעיל</span>
        </div>
      )}
    </div>
  );
};

export default PaymentFilters;

