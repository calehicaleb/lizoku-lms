import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import * as api from '../../services/api';
import { User, UserRole, UserStatus } from '../../types';
import { Icon } from '../../components/icons';

const emptyUser: Partial<User> = {
    name: '',
    email: '',
    role: UserRole.Student,
    status: UserStatus.Pending,
};

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>(emptyUser);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await api.getAllUsers();
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setSelectedUser(user);
            setFormData(user);
        } else {
            setSelectedUser(null);
            setFormData(emptyUser);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setFormData(emptyUser);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id.replace('user-', '')]: value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.role || !formData.status) {
            alert('Please fill all fields.');
            return;
        }

        try {
            if (selectedUser) {
                const updated = await api.updateUser(selectedUser.id, formData as any);
                if (updated) {
                    setUsers(users.map(u => u.id === updated.id ? updated : u));
                }
            } else {
                const created = await api.createUser(formData as any);
                setUsers([created, ...users]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save user", error);
            alert("An error occurred while saving the user.");
        }
    };
    
    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const result = await api.deleteUser(userId);
                if (result.success) {
                    setUsers(users.filter(u => u.id !== userId));
                } else {
                    alert('Failed to delete user.');
                }
            } catch (error) {
                 console.error("Failed to delete user", error);
                 alert("An error occurred while deleting the user.");
            }
        }
    };
    
    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <PageHeader title="User Management" subtitle="View, filter, and manage all user accounts." />

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="lg:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Roles</option>
                        {Object.values(UserRole).map(role => <option key={role} value={role} className="capitalize">{role}</option>)}
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Statuses</option>
                        {Object.values(UserStatus).map(status => <option key={status} value={status} className="capitalize">{status}</option>)}
                    </select>
                </div>
                 <div className="flex justify-end mb-4">
                    <button onClick={() => handleOpenModal()} className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center">
                        <Icon name="User" className="h-5 w-5 mr-2" />
                        Add User
                    </button>
                </div>
                
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Role</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Joined</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 capitalize">{user.role}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                         <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            user.status === 'banned' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>{user.status}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{user.createdAt}</td>
                                    <td className="px-4 py-3 whitespace-nowrap space-x-4">
                                        <button onClick={() => handleOpenModal(user)} className="text-secondary hover:text-secondary-dark font-medium">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedUser ? 'Edit User' : 'Add User'}>
                 <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" id="user-name" value={formData.name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label htmlFor="user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="user-email" value={formData.email} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select id="user-role" value={formData.role} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                                {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="user-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="user-status" value={formData.status} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary capitalize">
                                {Object.values(UserStatus).map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end space-x-2">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-medium text-gray-800 bg-primary border border-transparent rounded-md hover:bg-primary-dark">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default UserManagementPage;