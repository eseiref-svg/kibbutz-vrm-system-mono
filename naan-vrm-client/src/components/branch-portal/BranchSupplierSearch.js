import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

function BranchSupplierSearch({ query, setQuery, criteria, setCriteria, onSearch, onClear }) {

  const getPlaceholder = () => {
    if (criteria === 'name') {
      return 'הקלד שם ספק...';
    }
    if (criteria === 'tag') {
      return 'הקלד תג... (למשל: food, travel)';
    }
    if (criteria === 'id') {
      return 'הקלד ערך לחיפוש...'; // Or 'Type company ID...'
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
    <div className="mb-4">
      {/* Removed Title - Parent component handles the section title */}
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
            className="whitespace-nowrap"
          >
            חיפוש
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BranchSupplierSearch;
