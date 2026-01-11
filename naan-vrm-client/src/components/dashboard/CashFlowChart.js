import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register all the necessary components for a Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CashFlowChart({ income = 0, expenses = 0, netCashFlow = 0 }) {
  const data = {
    labels: ['הכנסות', 'הוצאות'],
    datasets: [{
      label: 'תזרים (₪)',
      data: [income, expenses],
      backgroundColor: ['#2196F3', '#FF7043'],
      borderRadius: 5
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div style={{ flexGrow: 1, minHeight: '150px' }}>
        <Bar data={data} options={options} />
      </div>
      <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center">
        <span className="text-gray-600 font-medium">תזרים צפוי:</span>
        <span className={`text-xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} dir="ltr">
          ₪{netCashFlow.toLocaleString('he-IL')}
        </span>
      </div>
    </div>
  );
}

export default CashFlowChart;
