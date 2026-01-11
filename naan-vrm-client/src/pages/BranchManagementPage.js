import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';

function BranchManagementPage() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);

    // Users for Manager Selection
    const [users, setUsers] = useState([]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const res = await api.get('/branches');
            setBranches(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('שגיאה בטעינת הענפים');
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users'); // Assuming we have this endpoint now
            // Filter for potential managers if needed, or show all
            setUsers(res.data.filter(u => u.status === 'active'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchUsers();
    }, []);

    const handleOpenModal = (branch = null) => {
        if (branch) {
            setIsEditing(true);
            setCurrentBranch({ ...branch });
        } else {
            setIsEditing(false);
            setCurrentBranch({ name: '', business: false, manager_id: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBranch(null);
    };

    const handleSubmit = async () => {
        try {
            if (!currentBranch.name) return;

            if (isEditing) {
                await api.put(`/branches/${currentBranch.branch_id}`, currentBranch);
            } else {
                await api.post('/branches', currentBranch);
            }
            fetchBranches();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('שגיאה בשמירת הענף');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-gray-800">ניהול ענפים</h2>
                <Button variant="success" onClick={() => handleOpenModal()}>
                    + ענף חדש
                </Button>
            </div>

            {loading && <p>טוען...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="py-3 px-4 text-right font-semibold">שם הענף</th>
                                <th className="py-3 px-4 text-right font-semibold">סוג ענף</th>
                                <th className="py-3 px-4 text-right font-semibold">מנהל אחראי</th>
                                <th className="py-3 px-4 text-right font-semibold">פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branches.map(branch => (
                                <tr key={branch.branch_id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{branch.name}</td>
                                    <td className="py-3 px-4">
                                        {branch.business ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">עסקי</span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">קהילתי</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {branch.manager_name || <span className="text-gray-400">- ללא -</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenModal(branch)}>ערוך</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={isEditing ? 'עריכת ענף' : 'יצירת ענף חדש'}
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>ביטול</Button>
                        <Button variant="primary" onClick={handleSubmit}>שמור</Button>
                    </>
                }
            >
                {currentBranch && (
                    <div className="space-y-4">
                        <Input
                            label="שם הענף"
                            value={currentBranch.name}
                            onChange={(e) => setCurrentBranch({ ...currentBranch, name: e.target.value })}
                        />

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="br_business"
                                checked={currentBranch.business || false}
                                onChange={(e) => setCurrentBranch({ ...currentBranch, business: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <label htmlFor="br_business">ענף עסקי (מחושב ברווח/הפסד)</label>
                        </div>

                        <Select
                            name="manager_id"
                            label="מנהל ענף"
                            value={currentBranch.manager_id || ''}
                            onChange={(e) => setCurrentBranch({ ...currentBranch, manager_id: e.target.value || null })}
                            options={[
                                { value: '', label: '- ללא מנהל -' },
                                ...users.map(u => ({
                                    value: u.user_id,
                                    label: `${u.first_name} ${u.surname} (${u.email})`
                                }))
                            ]}
                        />
                    </div>
                )}
            </Modal>

        </div>
    );
}

export default BranchManagementPage;
