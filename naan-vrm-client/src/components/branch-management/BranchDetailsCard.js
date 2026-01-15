import React from 'react';
import StandardDetailsCard from '../shared/StandardDetailsCard';
import StandardDataRow from '../shared/StandardDataRow';

function BranchDetailsCard({ branch, onBack, onEdit, onStatusToggle }) {
    if (!branch) return null;

    const isBusiness = branch.business;
    const typeLabel = isBusiness ? 'ענף עסקי' : 'ענף קהילתי';

    // Fallback if is_active is null/undefined (for old records before migration?)
    // Migration set default to TRUE so it should be fine.
    const isActive = branch.is_active !== false;

    return (
        <StandardDetailsCard
            title={branch.name}
            subtitle={typeLabel}
            isActive={isActive}
            statusLabels={{ active: 'פעיל', inactive: 'לא פעיל' }}
            onBack={onBack}
            onEdit={() => onEdit(branch)}
            onStatusToggle={onStatusToggle}
            entityType="ענף"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* General Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">פרטי הענף</h3>
                    <StandardDataRow
                        label="סוג ענף"
                        value={typeLabel}
                    />
                    <StandardDataRow
                        label="מזהה מערכת"
                        value={branch.branch_id}
                    />
                </div>

                {/* Manager Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-700 border-b border-blue-200 pb-2 mb-4">ניהול ואחריות</h3>
                    <StandardDataRow
                        label="מנהל ענף"
                        value={branch.manager_name || 'לא משויך'}
                    />
                </div>

            </div>
        </StandardDetailsCard>
    );
}

export default BranchDetailsCard;
