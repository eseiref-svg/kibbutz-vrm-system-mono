import React from 'react';

// A reusable card component
function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">{title}</h3>
      <div className="flex-grow flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default InfoCard;