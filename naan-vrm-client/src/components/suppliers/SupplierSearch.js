import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

function SupplierSearch({ query, setQuery, criteria, setCriteria, onSearch, onClear }) {

  const getPlaceholder = () => {
    if (criteria === 'name') {
      return 'הקלד שם ספק...';
    }
    if (criteria === 'tag') {
      return 'הקלד תג... (למשל: food, travel)';
    }
    return 'הקלד ערך לחיפוש...';
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">חיפוש ספק מאושר</h3>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-2">
          <Select
            label="סוג חיפוש"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            options={[
              { value: 'name', label: 'לפי שם' },
              { value: 'tag', label: 'לפי תג' },
              { value: 'id', label: 'לפי ח.פ.' }
            ]}
            fullWidth={true}
          />
        </div>

        <div className="sm:col-span-8">
          <Input
            type="text"
            label="הקלד שם ספק..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
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
            חיפוש
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SupplierSearch;
