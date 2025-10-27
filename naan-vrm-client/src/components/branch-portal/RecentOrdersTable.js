// src/components/branch-portal/RecentOrdersTable.js
import React from 'react';

function RecentOrdersTable({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return <p>לא נמצאו עסקאות אחרונות עבור ענף זה.</p>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 font-medium';
      case 'pending': return 'text-yellow-600 font-medium';
      case 'rejected': return 'text-red-600 font-medium';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white text-sm">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-4 text-right">ספק</th>
            <th className="py-3 px-4 text-right">תאריך יעד</th>
            <th className="py-3 px-4 text-right">סכום (₪)</th>
            <th className="py-3 px-4 text-right">סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.transaction_id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{tx.supplier_name}</td>
              <td className="py-3 px-4">{new Date(tx.due_date).toLocaleDateString('he-IL')}</td>
              <td className="py-3 px-4">₪{parseFloat(tx.value).toLocaleString('he-IL')}</td>
              <td className={`py-3 px-4 ${getStatusStyle(tx.status)}`}>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentOrdersTable;