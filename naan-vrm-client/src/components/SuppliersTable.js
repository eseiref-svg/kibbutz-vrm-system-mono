import React from 'react';
import Button from './shared/Button';

function SuppliersTable({ suppliers, onDelete, onEdit, onRowClick }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-right font-semibold">ID</th>
            <th className="py-3 px-4 text-right font-semibold">שם הספק</th>
            <th className="py-3 px-4 text-right font-semibold">איש קשר</th>
            <th className="py-3 px-4 text-right font-semibold">סטטוס</th>
            <th className="py-3 px-4 text-right font-semibold">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr 
              key={supplier.supplier_id}
              onClick={() => onRowClick(supplier)}
              className="cursor-pointer hover:bg-gray-50 border-b transition-colors"
            >
              <td className="py-3 px-4">{supplier.supplier_id}</td>
              <td className="py-3 px-4">{supplier.name}</td>
              <td className="py-3 px-4">{supplier.poc_name}</td>
              <td className="py-3 px-4">{supplier.status}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(supplier);
                    }}
                  >
                    ערוך
                  </Button>
                  <Button 
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(supplier.supplier_id);
                    }}
                  >
                    מחק
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuppliersTable;
