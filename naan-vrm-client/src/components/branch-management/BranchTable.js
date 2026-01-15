import React from 'react';
import { LuPencil, LuBan, LuCheck } from 'react-icons/lu';
import IconButton from '../shared/IconButton';

function BranchTable({ branches, onStatusToggle, onEdit, onRowClick }) {
    if (branches.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow border p-8 text-center text-gray-500">
                לא נמצאו ענפים.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="min-w-full text-sm">
                <thead className="bg-blue-50 border-b border-blue-100">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">שם הענף</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">סוג ענף</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">מנהל אחראי</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">סטטוס</th>
                        <th className="py-3 px-4 text-right font-semibold text-gray-700">פעולות</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {branches.map(branch => (
                        <tr
                            key={branch.branch_id}
                            className={`hover:bg-blue-50 cursor-pointer transition-colors ${!branch.is_active ? 'opacity-60 bg-gray-50' : ''}`}
                            onClick={() => onRowClick(branch)}
                        >
                            <td className="py-3 px-4 font-medium text-gray-800">{branch.name}</td>
                            <td className="py-3 px-4">
                                {branch.business ? (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">עסקי</span>
                                ) : (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">קהילתי</span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {branch.manager_name || <span className="text-gray-400">- ללא -</span>}
                            </td>
                            <td className="py-3 px-4">
                                {branch.is_active === false ? (
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">לא פעיל</span>
                                ) : (
                                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">פעיל</span>
                                )}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(branch);
                                        }}
                                        icon={<LuPencil size={18} />}
                                        variant="primary"
                                        title="ערוך"
                                    />
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStatusToggle(branch);
                                        }}
                                        icon={branch.is_active === false ? <LuCheck size={18} /> : <LuBan size={18} />}
                                        variant={branch.is_active === false ? 'success' : 'danger'}
                                        title={branch.is_active === false ? 'הפעל ענף' : 'השבת ענף'}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BranchTable;
