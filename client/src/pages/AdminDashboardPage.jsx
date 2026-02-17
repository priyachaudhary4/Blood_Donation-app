import React, { useState } from 'react';
import BloodStockManager from '../components/admin/BloodStockManager';
import HospitalRequestManager from '../components/admin/HospitalRequestManager';
import DonorNotificationsManager from '../components/admin/DonorNotificationsManager';
import RequestSessionManager from '../components/admin/RequestSessionManager';
import AdminSupport from '../components/admin/AdminSupport';
import AdminProfile from '../components/admin/AdminProfile';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardPage = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('stock');

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <h1 className="text-xl font-bold text-primary-600">BloodLink Admin</h1>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">Welcome, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex space-x-4 mb-6">
                        <button
                            onClick={() => setActiveTab('stock')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'stock'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Blood Stock
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'requests'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Hospital Requests
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'notifications'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Donor Responses
                        </button>
                        <button
                            onClick={() => setActiveTab('session')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'session'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Blood Drives
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'support'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Support Inbox
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'profile'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                        >
                            Profile
                        </button>
                    </div>

                    {activeTab === 'stock' && <BloodStockManager />}
                    {activeTab === 'requests' && <HospitalRequestManager />}
                    {activeTab === 'notifications' && <DonorNotificationsManager />}
                    {activeTab === 'session' && <RequestSessionManager />}
                    {activeTab === 'support' && <AdminSupport />}
                    {activeTab === 'profile' && <AdminProfile />}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
