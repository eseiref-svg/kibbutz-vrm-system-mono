import React from 'react';

function ClientSearch({ query, setQuery, criteria, setCriteria, onSearch }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">חיפוש לקוחות</h3>
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-gray-700 font-semibold mb-2">מונח חיפוש</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            placeholder="הזן שם לקוח..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <label className="block text-gray-700 font-semibold mb-2">חפש לפי</label>
          <select
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">שם לקוח</option>
            <option value="id">מספר לקוח</option>
            <option value="branch">שם ענף</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-6 rounded-lg"
        >
          חפש
        </button>
      </div>
    </div>
  );
}

export default ClientSearch;




