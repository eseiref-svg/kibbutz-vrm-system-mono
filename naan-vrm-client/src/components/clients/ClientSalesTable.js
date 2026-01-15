import React from 'react';
import { LuCheck } from 'react-icons/lu';
import api from '../../api/axiosConfig';
import { formatCurrency } from '../../utils/formatCurrency';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ClientSalesTable({ sales, onRefresh }) {
  const handleMarkPaid = async (saleId) => {
    if (window.confirm('האם לסמן תשלום זה כשולם?')) {
      try {
        await api.put(`/sales/${saleId}/mark-paid`, {
          actual_date: new Date().toISOString().split('T')[0]
        });
        alert('התשלום סומן כשולם בהצלחה');
        onRefresh();
      } catch (error) {
        console.error('Error marking payment as paid:', error);
        alert('שגיאה בעדכון הסטטוס');
      }
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
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">שולם</span>;
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">ממתין לתשלום</span>;
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>אין עדיין היסטוריית מכירות ללקוח זה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">מספר עסקה</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">סוג עסקה</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">סכום</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">תאריך יעד</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">תאריך תשלום בפועל</th>
            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">סטטוס</th>
            <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">פעולות</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.sale_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.sale_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  מכירה
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-700">
                {formatCurrency(sale.value)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(sale.due_date).toLocaleDateString('he-IL')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {sale.actual_date ? new Date(sale.actual_date).toLocaleDateString('he-IL') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(sale.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handleGeneratePDF(sale.sale_id)}
                    className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 px-3 py-1 rounded transition-colors text-xs"
                    title="הפק דרישת תשלום (PDF)"
                  >
                    PDF
                  </button>
                  {sale.status === 'open' && (
                    <button
                      onClick={() => handleMarkPaid(sale.sale_id)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="סמן כשולם"
                    >
                      <LuCheck className="w-5 h-5" />
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




