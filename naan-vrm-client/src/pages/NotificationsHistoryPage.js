import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';
import { useNotifications } from '../context/NotificationContext'; // For updating the bell
import NotificationsHistoryTable from '../components/notifications/NotificationsHistoryTable';
import Button from '../components/shared/Button';

function NotificationsHistoryPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
    const [statusFilter, setStatusFilter] = useState(''); // '' (all), 'read', 'unread' (mapped to server expected false/true logic if needed, but server expects string 'read' from query if I recall correctly)
    // Re-checking server implementation:
    // if (status) { const isRead = status === 'read'; ... }
    // So passed status='read' means is_read=true.
    // Passing status='unread' -> isRead=false -> is_read=false.

    const { triggerRefresh } = useNotifications();

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
            };

            if (statusFilter === 'read') {
                params.status = 'read';
            } else if (statusFilter === 'unread') {
                params.status = 'unread';
            }

            const response = await api.get('/api/notifications/history', { params });
            setNotifications(response.data.notifications);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching notification history:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchNotifications(1); // Reset to page 1 on filter change
    }, [fetchNotifications]);

    const handlePageChange = (newPage) => {
        fetchNotifications(newPage);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            // Update local state without full reload if possible, or just reload
            setNotifications(prev =>
                prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
            );
            triggerRefresh(); // Update the bell count
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            fetchNotifications(pagination.current);
            triggerRefresh();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">היסטוריית התראות</h1>
                    <p className="text-gray-600 mt-1">צפה בכל ההתראות שהתקבלו במערכת</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                        <button
                            onClick={() => setStatusFilter('')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === '' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            הכל
                        </button>
                        <button
                            onClick={() => setStatusFilter('unread')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            חדשות
                        </button>
                        <button
                            onClick={() => setStatusFilter('read')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === 'read' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            נקראו
                        </button>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <Button variant="success" onClick={handleMarkAllAsRead}>
                            סמן הכל כנקרא
                        </Button>
                    )}
                </div>
            </div>

            <NotificationsHistoryTable
                notifications={notifications}
                pagination={pagination}
                onPageChange={handlePageChange}
                onMarkAsRead={handleMarkAsRead}
                loading={loading}
            />
        </div>
    );
}

export default NotificationsHistoryPage;
