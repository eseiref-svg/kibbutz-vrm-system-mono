import React from 'react';

function ClientsTable({ clients, onDelete, onRowClick }) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">לא נמצאו לקוחות</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              מספר לקוח
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              שם הלקוח
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              איש קשר
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              טלפון
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              אימייל
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              עיר
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr 
              key={client.client_id} 
              className="hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onRowClick(client)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {client.client_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                {client.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {client.poc_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {client.poc_phone || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {client.poc_email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {client.city || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(client.client_id);
                  }}
                  className="text-red-600 hover:text-red-900 ml-4"
                >
                  מחק
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsTable;



