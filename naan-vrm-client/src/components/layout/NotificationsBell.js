import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; // Using automatic key holder
import { useNotifications } from '../../context/NotificationContext';

function NotificationsBell() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const { refreshTrigger } = useNotifications();

  useEffect(() => {
    const fetchCount = () => {
      // Request now uses api instead of axios
      api.get('/notifications/pending-requests-count')
        .then(response => {
          setCount(response.data.count);
        })
        .catch(error => {
          // It's normal to get a 401 here if the user is logged out, so we don't need to log every error
          if (error.response?.status !== 401) {
            console.error("Error fetching notification count:", error);
          }
        });
    };

    fetchCount();
    // Check for new notifications periodically
    const interval = setInterval(fetchCount, 5000); // every 5 seconds for faster updates

    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);
  }, [refreshTrigger]); // Refresh immediately when refreshTrigger changes

  const handleClick = () => {
    if (count > 0) {
      navigate('/');
      // Auto-scroll to requests widget after page loads
      setTimeout(() => {
        const element = document.getElementById('supplier-requests-widget');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div 
      className="relative cursor-pointer hover:opacity-70 transition-opacity"
      onClick={handleClick}
      title={count > 0 ? `${count} בקשות ממתינות - לחץ לצפייה` : 'אין בקשות חדשות'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {count}
        </span>
      )}
    </div>
  );
}

export default NotificationsBell;

