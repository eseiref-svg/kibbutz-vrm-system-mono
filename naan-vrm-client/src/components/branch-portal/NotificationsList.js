import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import Button from '../shared/Button';

function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = showAll ? '/notifications' : '/notifications/unread';
      const response = await api.get(endpoint);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      // Local update of the list
      setNotifications(prev =>
        prev.map(notif =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === 'supplier_approved') {
      return '✅';
    } else if (type === 'supplier_rejected') {
      return '❌';
    }
    return null;
  };

  if (loading) {
    return <div className="p-4 text-center">טוען התראות...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h3 className="text-xl font-bold text-gray-800">
          התראות {!showAll && `(${notifications.length} חדשות)`}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showAll ? 'secondary' : 'primary'}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'הצג חדשות בלבד' : 'הצג את כל ההתראות'}
          </Button>
          {notifications.some(n => !n.is_read) && (
            <Button
              size="sm"
              variant="success"
              onClick={markAllAsRead}
            >
              סמן הכל כנקרא
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {showAll ? 'אין התראות במערכת.' : 'אין התראות חדשות.'}
        </p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`p-4 rounded-lg border-r-4 transition-colors ${notification.is_read
                ? 'bg-gray-50 border-gray-300'
                : 'bg-blue-50 border-blue-500'
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${notification.is_read ? 'text-gray-700' : 'text-blue-900'}`}>
                        {notification.message.split('. סיבה:')[0]}
                      </span>
                      {notification.message.includes('. סיבה:') && (
                        <span className="text-sm text-gray-600 mt-1">
                          סיבה:{notification.message.split('. סיבה:')[1]}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.created_at).toLocaleString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markAsRead(notification.notification_id)}
                  >
                    סמן כנקרא
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsList;

