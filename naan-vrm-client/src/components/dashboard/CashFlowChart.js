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

function CashFlowChart() {
  const data = {
    labels: ['הכנסות', 'הוצאות'],
    datasets: [{
      label: 'תזרים (₪)',
      data: [1500000, 1200000], // Sample data
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
    <div style={{ height: '150px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default CashFlowChart;

