import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

function ClientSearch({ query, setQuery, criteria, setCriteria, onSearch }) {

  const getPlaceholder = () => {
    if (criteria === 'name') return 'הזן שם לקוח...';
    if (criteria === 'id') return 'הזן מספר לקוח...';
    if (criteria === 'branch') return 'הזן שם ענף...';
    return 'הקלד ערך לחיפוש...';
  };

  const handleClear = () => {
    setQuery('');
    // ClientSearch currently doesn't accept an onClear prop in the original code, 
    // but for consistency with others we prepare the handler. 
    // If the parent component supports clearing via a separate function, it can be added here.
    // For now, just clearing the query is what the original input would do if cleared manually.
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">חיפוש לקוחות</h3>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-2">
          <Select
            label="סוג חיפוש"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            options={[
              { value: 'name', label: 'שם לקוח' },
              { value: 'id', label: 'מספר לקוח' },
              { value: 'branch', label: 'שם ענף' }
            ]}
            fullWidth={true}
          />
        </div>

        <div className="sm:col-span-8">
          <Input
            type="text"
            label="מונח חיפוש"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder={getPlaceholder()}
            showClearButton={true}
            onClear={handleClear}
          />
        </div>

        <div className="sm:col-span-2">
          <Button
            onClick={onSearch}
            variant="primary"
            fullWidth={true}
          >
            חפש
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ClientSearch;




