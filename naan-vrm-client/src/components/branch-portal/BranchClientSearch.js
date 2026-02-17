import React from 'react';
import Button from '../shared/Button';
import Input from '../shared/Input';
import Select from '../shared/Select';

function BranchClientSearch({ query, setQuery, criteria, setCriteria, onSearch, onClear }) {

  const getPlaceholder = () => {
    if (criteria === 'name') return 'הקלד שם לקוח (חלקי)...';
    if (criteria === 'id') return 'הקלד מספר לקוח (מזהה)...';
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
      <h4 className="text-lg font-semibold mb-3">חיפוש לקוח</h4>
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-3">
          <Select
            value={criteria}
            label="סוג חיפוש"
            onChange={(e) => setCriteria(e.target.value)}
            options={[
              { value: 'name', label: 'לפי שם' },
              { value: 'id', label: 'לפי מספר לקוח (מזהה)' }
            ]}
            fullWidth={true}
          />
        </div>
        <div className="sm:col-span-7">
          <Input
            value={query}
            label="ערך לחיפוש"
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            showClearButton={true}
            onClear={handleClear}
          />
        </div>
        <div className="sm:col-span-2">
          <Button
            variant="primary"
            onClick={onSearch}
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

export default BranchClientSearch;

