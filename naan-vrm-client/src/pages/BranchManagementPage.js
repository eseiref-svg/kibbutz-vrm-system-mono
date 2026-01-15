import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import Modal from '../components/shared/Modal';
import Input from '../components/shared/Input';
import Select from '../components/shared/Select';
import BranchDetailsCard from '../components/branch-management/BranchDetailsCard';
import BranchTable from '../components/branch-management/BranchTable';

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
            const res = await api.get('/users');
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

    const handleStatusToggle = async (branch) => {
        if (!window.confirm(`האם אתה בטוח שברצונך ${branch.is_active ? 'להשבית' : 'להפעיל'} את הענף '${branch.name}'?`)) {
            return;
        }

        try {
            const updatedBranch = { ...branch, is_active: !branch.is_active };
            await api.put(`/branches/${branch.branch_id}`, {
                name: branch.name,
                business: branch.business,
                manager_id: branch.manager_id,
                is_active: !branch.is_active
            });
            fetchBranches();
            // If viewing details card, update it too
            if (currentBranch && currentBranch.branch_id === branch.branch_id) {
                setCurrentBranch(prev => ({ ...prev, is_active: !prev.is_active }));
            }
        } catch (err) {
            console.error(err);
            alert('שגיאה בעדכון סטטוס הענף');
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
                <>
                    {currentBranch && !isEditing && !isModalOpen ? (
                        <div className="py-6">
                            <BranchDetailsCard
                                branch={currentBranch}
                                onBack={() => setCurrentBranch(null)}
                                onEdit={() => handleOpenModal(currentBranch)}
                                onStatusToggle={() => handleStatusToggle(currentBranch)}
                            />
                        </div>
                    ) : (
                        <BranchTable
                            branches={branches}
                            onEdit={handleOpenModal}
                            onStatusToggle={handleStatusToggle}
                            onRowClick={setCurrentBranch}
                        />
                    )}
                </>
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
