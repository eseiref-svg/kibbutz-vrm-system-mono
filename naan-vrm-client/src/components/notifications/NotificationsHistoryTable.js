import React from 'react';
import Button from '../shared/Button';

function NotificationsHistoryTable({ notifications, pagination, onPageChange, onMarkAsRead, loading }) {
    if (loading) {
        return <div className="text-center py-8">טוען נתונים...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
                <p className="text-gray-500 text-lg">לא נמצאו התראות.</p>
            </div>
        );
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'supplier_approved': return '✅';
            case 'supplier_rejected': return '❌';
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return null;
            default: return null;
        }
    };

    const getStatusBadge = (isRead) => {
        return isRead ? (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">נקרא</span>
        ) : (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">חדש</span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">סטטוס</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">סוג</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">הודעה</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">תאריך</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <tr
                                key={notification.notification_id}
                                className={`hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(notification.is_read)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xl">
                                    {getNotificationIcon(notification.type)}
                                </td>
                                <td className="px-6 py-4">
                                    <p className={`text-sm ${notification.is_read ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                        {notification.message}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(notification.created_at).toLocaleString('he-IL', {
                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {!notification.is_read && onMarkAsRead && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => onMarkAsRead(notification.notification_id)}
                                        >
                                            סמן כנקרא
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center bg-gray-100">
                    <div className="text-sm text-gray-500">
                        מציג {pagination.limit} התראות מתוך {pagination.total}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={pagination.current === 1}
                            onClick={() => onPageChange(pagination.current - 1)}
                        >
                            הקודם
                        </Button>
                        <span className="px-4 py-1.5 bg-white border border-gray-300 rounded text-sm flex items-center">
                            עמוד {pagination.current} מתוך {pagination.pages}
                        </span>
                        <Button
                            size="sm"
                            variant="secondary"
                            disabled={pagination.current === pagination.pages}
                            onClick={() => onPageChange(pagination.current + 1)}
                        >
                            הבא
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationsHistoryTable;
