import React from 'react';
import { LuPencil, LuBan, LuCheck, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Rating } from '@mui/material';
import IconButton from './shared/IconButton';

function SuppliersTable({ suppliers, onDeactivate, onEdit, onRowClick, mode = 'treasurer', pagination, onPageChange }) {
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
      <div className="flex items-center gap-2 justify-end" dir="ltr">
        <Rating
          value={parseFloat(rating)}
          readOnly
          size="small"
          precision={0.1}
        />
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
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                שם הספק
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                תחום ספק
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                איש קשר
              </th>

              {/* Rating Column - For everyone */}
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                דירוג
              </th>

              {/* Status & Actions - Treasurer Only */}
              {mode === 'treasurer' && (
                <>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
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


      {/* Pagination Footer */}
      {
        pagination && pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(Math.max(1, pagination.current - 1))}
                disabled={pagination.current === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                הקודם
              </button>
              <button
                onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.current + 1))}
                disabled={pagination.current === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                הבא
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  מציג עמוד <span className="font-medium">{pagination.current}</span> מתוך <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(Math.max(1, pagination.current - 1))}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <LuChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {/* Page Numbers */}
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pagination.totalPages > 7 && Math.abs(pageNum - pagination.current) > 2 && pageNum !== 1 && pageNum !== pagination.totalPages) {
                      if (Math.abs(pageNum - pagination.current) === 3) return <span key={pageNum} className="px-2">...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.current === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.current + 1))}
                    disabled={pagination.current === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <LuChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default SuppliersTable;
