import React from 'react';
import { LuPencil, LuBan, LuCheck } from 'react-icons/lu';
import Button from '../shared/Button';
import IconButton from '../shared/IconButton';

function UsersTable({ users, onStatusToggle, onEdit, onRowClick }) {
    if (users.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <p className="text-gray-500">לא נמצאו משתמשים</p>
            </div>
        );
    }

    const roleMap = {
        'admin': 'Admin',
        'treasurer': 'גזבר',
        'bookkeeper': 'הנהלת חשבונות',
        'branch_manager': 'מנהל ענף',
        'community_manager': 'מנהל קהילה'
    };

    const handleStatusClick = (e, user) => {
        e.stopPropagation();
        if (onStatusToggle) {
            onStatusToggle(user);
        }
    };

    const handleEditClick = (e, user) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(user);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                שם מלא
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                אימייל
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                תפקיד
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                סטטוס
                            </th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                                פעולות
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const isActive = user.status === 'active';

                            return (
                                <tr
                                    key={user.user_id}
                                    onClick={() => onRowClick(user)}
                                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${!isActive ? 'bg-gray-50 text-gray-500' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">
                                        {user.first_name} {user.surname}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {roleMap[user.role] || user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {isActive ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                פעיל
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                לא פעיל
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                        <IconButton
                                            onClick={(e) => handleEditClick(e, user)}
                                            icon={<LuPencil size={18} />}
                                            variant="primary"
                                            title="ערוך פרטי משתמש"
                                        />
                                        <IconButton
                                            onClick={(e) => handleStatusClick(e, user)}
                                            icon={isActive ? <LuBan size={18} /> : <LuCheck size={18} />}
                                            variant={isActive ? 'danger' : 'success'}
                                            title={isActive ? "השבת משתמש" : "הפעל משתמש"}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div >
        </div >
    );
}

export default UsersTable;
