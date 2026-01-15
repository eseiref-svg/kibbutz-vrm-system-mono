import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

function BranchSupplierSearch({ query, setQuery, criteria, setCriteria, onSearch, onClear }) {

  const getPlaceholder = () => {
    if (criteria === 'name') return 'הקלד שם ספק...';
    if (criteria === 'tag') return 'הקלד תג... (למשל: food, travel)';
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
      <h4 className="text-lg font-semibold mb-3">חיפוש ספק מאושר</h4>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <Select
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          options={[
            { value: 'name', label: 'לפי שם' },
            { value: 'tag', label: 'לפי תחום / תג' }
          ]}
          fullWidth={false}
          className="sm:w-44"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={getPlaceholder()}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="flex-grow"
          showClearButton={true}
          onClear={handleClear}
        />
        <Button
          variant="primary"
          onClick={onSearch}
          className="whitespace-nowrap sm:w-auto w-full"
        >
          חיפוש
        </Button>
      </div>
    </div>
  );
}

export default BranchSupplierSearch;
