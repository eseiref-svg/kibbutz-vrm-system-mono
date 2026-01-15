import React from 'react';
import StandardDetailsCard from '../shared/StandardDetailsCard';
import Button from '../shared/Button';
import StandardDataRow from '../shared/StandardDataRow';
import { LuKey } from 'react-icons/lu';

function UserDetailsCard({ user, onBack, onEdit, onPasswordReset, onStatusToggle }) {
    if (!user) return null;

    const roleMap = {
        'admin': 'Admin',
        'treasurer': 'גזבר',
        'bookkeeper': 'הנהלת חשבונות',
        'branch_manager': 'מנהל ענף',
        'community_manager': 'מנהל קהילה'
    };

    const isActive = user.status === 'active';

    return (
        <StandardDetailsCard
            title={`${user.first_name} ${user.surname}`}
            subtitle={roleMap[user.role] || user.role}
            isActive={isActive}
            onBack={onBack}
            onEdit={() => onEdit(user)}
            onStatusToggle={() => onStatusToggle(user)}
            entityType="משתמש"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">פרטי קשר</h3>
                    <StandardDataRow
                        label="אימייל"
                        value={user.email}
                    />
                    <StandardDataRow
                        label="טלפון"
                        value={user.phone_no || 'לא צוין'}
                    />
                </div>

                {/* System Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">נתוני מערכת</h3>
                    <StandardDataRow
                        label="תפקיד"
                        value={roleMap[user.role] || user.role}
                    />
                    {user.branch_id && (
                        <StandardDataRow
                            label="ענף משויך"
                            value={user.branch_id}
                        />
                    )}
                </div>
            </div>

            {/* Security Zone */}
            <div className="bg-gray-50 p-6 border-t border-gray-200 mt-8 rounded-b-xl -mx-8 -mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 h-full">אבטחה</h3>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                            <LuKey size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">איפוס סיסמה</p>
                            <p className="text-sm text-gray-500">שלח קישור לאיפוס סיסמה למשתמש זה</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => onPasswordReset(user.user_id)}>
                        שלח איפוס
                    </Button>
                </div>
            </div>
        </StandardDetailsCard>
    );
}

export default UserDetailsCard;
