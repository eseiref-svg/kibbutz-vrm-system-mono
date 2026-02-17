import React, { useState } from 'react';
import BranchFinancialDashboard from './BranchFinancialDashboard';
import TransactionsWidget from '../branch-portal/TransactionsWidget';
import { FiArrowRight, FiMoreVertical, FiCheckCircle, FiXCircle, FiUser, FiHash, FiPhone, FiMail } from 'react-icons/fi';

function BranchDetailsCard({ branch, onBack, onEdit, onStatusToggle }) {
    const [showMenu, setShowMenu] = useState(false);

    if (!branch) return null;

    const isBusiness = branch.business;
    const typeLabel = isBusiness ? 'ענף עסקי' : 'ענף קהילתי';
    const isActive = branch.is_active !== false;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in relative">

            {/* 1. Minimalist Header */}
            <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-400 hover:text-gray-800 transition-colors p-1">
                            <FiArrowRight size={24} />
                        </button>
                    )}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{branch.name}</h1>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1 ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {isActive ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                                {isActive ? 'פעיל' : 'לא פעיל'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${isBusiness ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                {typeLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    {/* Menu Action */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FiMoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                                    {onEdit && (
                                        <button
                                            className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 block"
                                            onClick={() => { setShowMenu(false); onEdit(branch); }}
                                        >
                                            ערוך פרטי ענף
                                        </button>
                                    )}
                                    {onStatusToggle && (
                                        <button
                                            className={`w-full text-right px-4 py-2 text-sm hover:bg-gray-50 block ${isActive ? 'text-red-600' : 'text-green-600'}`}
                                            onClick={() => { setShowMenu(false); onStatusToggle(branch); }}
                                        >
                                            {isActive ? 'הקפא ענף' : 'הפעל ענף'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Contextual Info Bar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-6 items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <FiHash className="text-gray-400" />
                    <span className="font-semibold">מזהה מערכת:</span>
                    <span className="font-mono">{branch.branch_id}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    <span className="font-semibold">מנהל ענף:</span>
                    <span>{branch.manager_name || 'לא משויך'}</span>
                </div>

                {/* Manager Contact Info */}
                {branch.manager_phone && (
                    <a href={`tel:${branch.manager_phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                        <FiPhone size={14} />
                        <span>{branch.manager_phone}</span>
                    </a>
                )}
                {branch.manager_email && (
                    <a href={`mailto:${branch.manager_email}`} className="flex items-center gap-1.5 text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                        <FiMail size={14} />
                        <span>{branch.manager_email}</span>
                    </a>
                )}
            </div>

            {/* 3. Main Content - Financial Dashboard */}
            <div className="p-8 bg-gray-50/30 min-h-[500px] flex flex-col gap-6">
                <BranchFinancialDashboard branchId={branch.branch_id} isBusiness={isBusiness} readOnly={true} />
                <TransactionsWidget branchId={branch.branch_id} isBusiness={isBusiness} />
            </div>

        </div>
    );
}

export default BranchDetailsCard;
