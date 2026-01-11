import React, { forwardRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Wrapping component with forwardRef allows parent to get direct access to chart component
const AnnualCashFlowChart = forwardRef(({ reportData }, ref) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 12 } } },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            if (value >= 1000000) return '₪' + (value / 1000000) + 'M';
            if (value >= 1000) return '₪' + (value / 1000) + 'K';
            return '₪' + value;
          }
        }
      }
    }
  };

  const labels = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  const incomeData = new Array(12).fill(0);
  const expenseData = new Array(12).fill(0);

  if (reportData) {
    reportData.forEach(item => {
      const monthIndex = parseInt(item.month.split('-')[1], 10) - 1;
      incomeData[monthIndex] = parseFloat(item.income);
      expenseData[monthIndex] = Math.abs(parseFloat(item.expense));
    });
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'הכנסות',
        data: incomeData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'הוצאות',
        data: expenseData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      },
    ],
  };

  return (
    <div className="relative" style={{ height: '400px' }}>
      {/* Passing ref to Line component allows us to "capture" it */}
      <Line ref={ref} options={options} data={data} />
    </div>
  );
});

export default AnnualCashFlowChart;

