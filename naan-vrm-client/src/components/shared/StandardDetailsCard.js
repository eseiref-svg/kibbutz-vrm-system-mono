import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import Button from './Button';

function StandardDetailsCard({
    title,
    subtitle,
    statusLabels = { active: 'פעיל', inactive: 'לא פעיל' },
    isActive,
    showStatus = true,
    onBack,
    onEdit,
    onStatusToggle,
    entityType = 'רשומה',
    children,
    extraActions
}) {
    return (
        <div className="bg-blue-50 rounded-xl shadow-lg border border-blue-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white p-6 border-b border-blue-100 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            title="חזור לרשימה"
                        >
                            <LuArrowRight size={24} />
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <div className="flex gap-2 mt-1 items-center">
                            {showStatus && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {isActive ? statusLabels.active : statusLabels.inactive}
                                </span>
                            )}
                            {subtitle && (
                                typeof subtitle === 'string'
                                    ? <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{subtitle}</span>
                                    : subtitle
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {extraActions}
                    {onEdit && (
                        <Button variant="outline" onClick={onEdit}>
                            ערוך פרטים
                        </Button>
                    )}
                    {onStatusToggle && (
                        <Button
                            variant={isActive ? "danger" : "success"}
                            onClick={onStatusToggle}
                        >
                            {isActive ? `השבת ${entityType}` : `הפעל ${entityType}`}
                        </Button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {children}
            </div>
        </div>
    );
}

export default StandardDetailsCard;
