import React from 'react';
import { LuPencil, LuBan, LuCheck, LuStar } from 'react-icons/lu';
import IconButton from './shared/IconButton';

function SuppliersTable({ suppliers, onDeactivate, onEdit, onRowClick, mode = 'treasurer' }) {
  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">לא נמצאו ספקים</p>
      </div>
    );
  }

  // Handle deactivation click
  const handleStatusToggle = (e, supplier) => {
    e.stopPropagation();
    if (onDeactivate) {
      onDeactivate(supplier);
    }
  };

  const handleEditClick = (e, supplier) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(supplier);
    }
  };

  const renderRating = (rating) => {
    if (!rating) return <span className="text-gray-400">-</span>;
    return (
      <div className="flex items-center gap-1 text-yellow-500">
        <span className="font-bold text-gray-700">{Math.round(Number(rating))}</span>
        <LuStar fill="currentColor" size={14} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-32">
                ח.פ.
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-1/4">
                שם הספק
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-1/6">
                תחום ספק
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-1/6">
                איש קשר
              </th>

              {/* Rating Column - For everyone */}
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-24">
                דירוג
              </th>

              {/* Status & Actions - Treasurer Only */}
              {mode === 'treasurer' && (
                <>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-24">
                    סטטוס פעילות
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 w-32">
                    פעולות
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => {
              // Determine if active. If field missing, assume active.
              const isActive = supplier.is_active !== false;

              return (
                <tr
                  key={supplier.supplier_id}
                  onClick={() => onRowClick(supplier)}
                  className={`hover:bg-blue-50 cursor-pointer transition-colors ${!isActive && mode === 'treasurer' ? 'bg-gray-50 text-gray-500' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.supplier_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {supplier.field || 'לא שויך'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {supplier.poc_name}
                  </td>

                  {/* Rating */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {renderRating(supplier.average_rating)}
                  </td>

                  {/* Status & Actions - Treasurer Only */}
                  {mode === 'treasurer' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isActive ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            פעיל
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            לא פעיל
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <IconButton
                          onClick={(e) => handleEditClick(e, supplier)}
                          icon={<LuPencil size={18} />}
                          variant="primary"
                          title="ערוך פרטי ספק"
                        />
                        <IconButton
                          onClick={(e) => handleStatusToggle(e, supplier)}
                          icon={isActive ? <LuBan size={18} /> : <LuCheck size={18} />}
                          variant={isActive ? 'danger' : 'success'}
                          title={isActive ? "השבת ספק" : "הפעל ספק"}
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuppliersTable;
