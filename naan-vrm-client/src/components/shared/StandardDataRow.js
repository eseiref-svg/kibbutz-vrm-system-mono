import React from 'react';

// A standardized row for displaying data.
// Updated: Removed icons based on user feedback to reduce visual clutter.
// Style: Label (top, gray) and Value (bottom, darker)
function StandardDataRow({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="block text-xs text-gray-500 font-medium mb-1">{label}</span>
            <span className="font-medium text-gray-800 break-all text-base leading-snug">
                {value || '-'}
            </span>
        </div>
    );
}

export default StandardDataRow;
