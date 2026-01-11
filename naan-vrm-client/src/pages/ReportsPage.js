import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosConfig';
import AnnualCashFlowChart from '../components/reports/AnnualCashFlowChart';
import Button from '../components/shared/Button';
import Select from '../components/shared/Select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// This is a Base64 encoded font that supports Hebrew.
const ARIAL_FONT_B64 = `AAEAAAARAQAABAAQRFNJRwAAAAAAA...`; // Abbreviated for display

function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const chartRef = useRef(null);

  // Payment reports state
  const [activeReport, setActiveReport] = useState('branch-profitability');
  const [paymentReportData, setPaymentReportData] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchReportData = () => {
      setLoading(true);
      setError('');
      api.get(`/reports/annual-cash-flow`, {
        params: { year: selectedYear }
      })
        .then(response => {
          setReportData(response.data);
        })
        .catch(err => {
          console.error("Error fetching report data:", err);
          setError('שגיאה בטעינת נתוני הדוח.');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchReportData();
  }, [selectedYear]);

  const fetchPaymentReportData = useCallback(async () => {
    setPaymentLoading(true);
    try {
      const endpoint = activeReport === 'branch-profitability'
        ? '/reports/branch-profitability'
        : '/reports/client-patterns';

      const response = await api.get(endpoint);
      setPaymentReportData(response.data);
    } catch (error) {
      console.error('Error fetching payment report data:', error);
    } finally {
      setPaymentLoading(false);
    }
  }, [activeReport]);

  useEffect(() => {
    fetchPaymentReportData();
  }, [fetchPaymentReportData]);

  const exportPaymentToCSV = () => {
    if (!paymentReportData || paymentReportData.length === 0) return;

    const headers = activeReport === 'overdue-by-branch'
      ? ['ענף', 'הכנסות באיחור', 'מספר ח-ן הכנסות', 'הוצאות באיחור', 'מספר ח-ן הוצאות']
      : ['ספק', 'סכום ממוצע', 'זמן תשלום ממוצע', 'אחוז איחורים'];

    const csvContent = [
      headers.join(','),
      ...paymentReportData.map(row => {
        if (activeReport === 'overdue-by-branch') {
          return [
            row.branch_name,
            row.overdue_income || 0,
            row.count_income || 0,
            row.overdue_expense || 0,
            row.count_expense || 0
          ].join(',');
        } else {
          return [row.supplier_name, row.avg_amount, row.avg_days, row.late_percentage].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payment_report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportPDF = async () => {
    if (!chartRef.current || !chartRef.current.canvas) return;

    try {
      const doc = new jsPDF();

      doc.addFileToVFS('Arial.ttf', ARIAL_FONT_B64);
      doc.addFont('Arial.ttf', 'Arial', 'normal');
      doc.setFont('Arial');

      doc.setR2L(true);
      doc.text(`דוח תזרים מזומנים לשנת ${selectedYear}`, 105, 15, { align: 'center' });

      const chartCanvas = chartRef.current.canvas;
      const imgData = chartCanvas.toDataURL('image/png', 1.0);
      doc.addImage(imgData, 'PNG', 15, 25, 180, 100);

      autoTable(doc, {
        startY: 135,
        head: [['הוצאות (ש"ח)', 'הכנסות (ש"ח)', 'חודש']],
        body: reportData.map(row => [
          Math.abs(parseFloat(row.expense)).toLocaleString('he-IL'),
          parseFloat(row.income).toLocaleString('he-IL'),
          new Date(row.month + '-01').toLocaleDateString('he-IL', { month: 'long' }),
        ]).reverse(),
        styles: { font: "Arial", halign: 'right' },
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        bodyStyles: { halign: 'center' },
      });

      doc.save(`cash_flow_report_${selectedYear}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("נכשל ביצירת קובץ ה-PDF.");
    }
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData.map(row => ({
      'חודש': row.month,
      'הכנסות': parseFloat(row.income),
      'הוצאות': Math.abs(parseFloat(row.expense))
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Cash Flow ${selectedYear}`);
    XLSX.writeFile(workbook, `cash_flow_report_${selectedYear}.xlsx`);
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }

  const paymentReports = [
    {
      id: 'branch-profitability',
      name: 'דוח רווחיות ענפים (עסקיים)',
      description: 'מאזן הכנסות והוצאות שנתי לפי ענף',
    },
    {
      id: 'client-patterns',
      name: 'דוח מוסר תשלומים של לקוחות',
      description: 'לקוחות עם פיגורים בתשלום (מינימום 2 עסקאות)',
    },
  ];

  const renderBranchProfitabilityReport = () => {
    if (paymentLoading) {
      return <div className="text-center py-8">טוען נתונים...</div>;
    }

    if (!paymentReportData || paymentReportData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>לא נמצאו נתונים לדוח זה</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ענף
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-green-700 uppercase tracking-wider">
                סה"כ הכנסות (השנה)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-red-700 uppercase tracking-wider">
                סה"כ הוצאות (השנה)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                מאזן רווח/הפסד
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentReportData.map((row, index) => {
              const profit = parseFloat(row.profit || 0);
              const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.branch_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                    ₪{parseFloat(row.total_income || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold">
                    ₪{parseFloat(row.total_expense || 0).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${profitColor}`}>
                    ₪{profit.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderClientPatternsReport = () => {
    if (paymentLoading) {
      return <div className="text-center py-8">טוען נתונים...</div>;
    }

    if (!paymentReportData || paymentReportData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>לא נמצאו נתונים לדוח זה</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                לקוח
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ענף משייך
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                מספר עסקאות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                אחוז חובות בפיגור
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentReportData.map((row, index) => {
              const latePct = parseFloat(row.late_percentage);
              const pctColor = latePct > 20 ? 'text-red-600' : 'text-gray-900';
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.branch_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.total_transactions}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${pctColor}`}>
                    {row.late_percentage}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Cash Flow Report Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            דוח תזרים מזומנים שנתי
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <label htmlFor="year-select" className="font-semibold whitespace-nowrap">בחר שנה:</label>
              <Select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={years.map(year => ({
                  value: year,
                  label: year.toString()
                }))}
                fullWidth={false}
                className="w-28"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center">
              <Button onClick={handleExportPDF} variant="danger" size="sm">יצא ל-PDF</Button>
              <Button onClick={handleExportExcel} variant="success" size="sm">יצא ל-Excel</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          {loading && <p>טוען נתוני דוח...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && reportData.length > 0 && (
            <AnnualCashFlowChart ref={chartRef} reportData={reportData} />
          )}
          {!loading && !error && reportData.length === 0 && (
            <p>לא נמצאו נתונים לשנה הנבחרת.</p>
          )}
        </div>
      </div>

      {/* Payment Reports Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            דוחות תשלומים
          </h2>
          <button
            onClick={exportPaymentToCSV}
            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            ייצוא ל-CSV
          </button>
        </div>

        {/* Report Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {paymentReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`p-6 rounded-lg border-2 transition-all ${activeReport === report.id
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Report Display */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeReport === 'branch-profitability' && renderBranchProfitabilityReport()}
          {activeReport === 'client-patterns' && renderClientPatternsReport()}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
