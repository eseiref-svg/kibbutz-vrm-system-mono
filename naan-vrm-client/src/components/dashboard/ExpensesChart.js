import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Explicit registration of all components needed for donut chart to work
ChartJS.register(ArcElement, Tooltip, Legend);

function ExpensesChart({ chartData }) {
  // Important check: if no data, show appropriate message instead of trying to draw empty chart
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <p className="text-center text-gray-500 text-sm">אין נתוני הוצאות להצגה.</p>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: 'הוצאות (₪)',
      data: chartData.data,
      backgroundColor: [
        '#3B82F6', // blue-500
        '#10B981', // green-500
        '#F59E0B', // amber-500
        '#6366F1', // indigo-500
        '#EF4444', // red-500
      ],
      borderColor: '#FFFFFF',
      borderWidth: 2,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Display legend on right side, more suitable for donut chart
        labels: {
          font: {
            size: 10
          },
          boxWidth: 20,
          padding: 10,
        }
      }
    }
  };

  return (
    <div style={{ height: '150px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export default ExpensesChart;

