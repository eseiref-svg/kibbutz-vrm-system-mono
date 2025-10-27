import React from 'react';
import { Bar } from 'react-chartjs-2';

function BalanceCard({ balanceData }) {
  if (!balanceData) {
    return <p>טוען נתוני מאזן...</p>;
  }

  const balance = parseFloat(balanceData.credit) - parseFloat(balanceData.debit);

  const chartData = {
    labels: ['חיובים', 'זיכויים'],
    datasets: [{
      data: [balanceData.debit, balanceData.credit],
      backgroundColor: ['#EF5350', '#4CAF50'],
      borderRadius: 5
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">מאזן הענף: {balanceData.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">יתרה נוכחית:</p>
          <p className={`text-5xl font-extrabold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            ₪{balance.toLocaleString('he-IL')}
          </p>
        </div>
        <div className="h-40">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default BalanceCard;