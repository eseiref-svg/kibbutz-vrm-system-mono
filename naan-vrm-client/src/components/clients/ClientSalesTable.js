import React, { useState } from 'react';

import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FiFileText, FiCheckCircle, FiLoader } from 'react-icons/fi';

function ClientSalesTable({ sales, onRefresh, simpleMode = false }) {
  const [markingPaid, setMarkingPaid] = useState({});

  const handleMarkPaid = async (saleId) => {
    try {
      setMarkingPaid(prev => ({ ...prev, [saleId]: true }));
      await api.put(`/sales/${saleId}/mark-paid`, {
        actual_date: new Date().toISOString().split('T')[0]
      });
      alert('התשלום סומן כשולם בהצלחה');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('שגיאה בעדכון הסטטוס');
    } finally {
      setMarkingPaid(prev => ({ ...prev, [saleId]: false }));
    }
  };

  const handleGeneratePDF = async (saleId) => {
    try {
      const response = await api.get(`/sales/${saleId}/payment-request`);
      const data = response.data;

      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text('דרישת תשלום', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, 20, 40);
      doc.text(`מספר דרישה: ${saleId}`, 20, 50);

      // Client details
      doc.setFontSize(14);
      doc.text('פרטי לקוח:', 20, 70);
      doc.setFontSize(11);
      doc.text(`שם: ${data.client_name}`, 20, 80);
      doc.text(`איש קשר: ${data.poc_name}`, 20, 90);
      if (data.poc_email) doc.text(`אימייל: ${data.poc_email}`, 20, 100);
      if (data.poc_phone) doc.text(`טלפון: ${data.poc_phone}`, 20, 110);

      // Payment details
      doc.setFontSize(14);
      doc.text('פרטי התשלום:', 20, 130);
      doc.setFontSize(11);
      doc.text(`סכום לתשלום: ${formatCurrency(data.value)}`, 20, 140);
      doc.text(`תאריך יעד: ${new Date(data.due_date).toLocaleDateString('he-IL')}`, 20, 150);
      if (data.payment_terms) doc.text(`תנאי תשלום: ${data.payment_terms}`, 20, 160);
      if (data.description) doc.text(`תיאור: ${data.description}`, 20, 170);

      doc.save(`payment_request_${saleId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('שגיאה בהפקת PDF');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200"><FiCheckCircle size={12} /> שולם</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200"><FiLoader size={12} /> ממתין</span>;
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-sm">אין עדיין היסטוריית פעילות ללקוח זה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {!simpleMode && <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">מזהה</th>}
            {!simpleMode && <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">סוג</th>}
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">תאריך יעד</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">סכום</th>
            {!simpleMode && <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">שולם בתאריך</th>}
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">סטטוס</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">פעולות</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sales.map((sale) => (
            <tr key={sale.sale_id} className="hover:bg-gray-50 transition-colors">
              {!simpleMode && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{sale.sale_id}</td>}
              {!simpleMode && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">מכירה</span>
                </td>
              )}

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                {new Date(sale.due_date).toLocaleDateString('he-IL')}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {formatCurrency(sale.value)}
              </td>

              {!simpleMode && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sale.actual_date ? new Date(sale.actual_date).toLocaleDateString('he-IL') : '-'}
                </td>
              )}

              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(sale.status)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handleGeneratePDF(sale.sale_id)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="הורד דרישת תשלום (PDF)"
                  >
                    <FiFileText size={18} />
                  </button>

                  {sale.status === 'open' && (
                    <button
                      onClick={() => handleMarkPaid(sale.sale_id)}
                      disabled={markingPaid[sale.sale_id]}
                      className={`p-1.5 rounded-md transition-colors ${markingPaid[sale.sale_id]
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:bg-green-50'
                        }`}
                      title="סמן כשולם"
                    >
                      <FiCheckCircle size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientSalesTable;




