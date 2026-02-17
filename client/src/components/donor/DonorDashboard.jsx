import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DonorProfile from './DonorProfile';
import DonorRequests from './DonorRequests';
import AvailabilityToggle from './AvailabilityToggle';
import DonationHistory from './DonationHistory';
import LocateMap from './LocateMap';
import DonorSupport from './DonorSupport';
import DonorBloodDrives from './DonorBloodDrives';
import { User, Bell, Activity, Clock, MapPin, MessageSquare, Calendar } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'requests', label: 'Requests', icon: Bell },
    { id: 'drives', label: 'Blood Drives', icon: Calendar },
    { id: 'history', label: 'History & Certificates', icon: Clock },
    { id: 'locate', label: 'Locate Us', icon: MapPin },
    { id: 'support', label: 'Support Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">Donor Dashboard</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Activity className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="text-xl font-bold text-gray-900">{user?.bloodType || 'Not set'}</p>
              </div>
            </div>
            <AvailabilityToggle
              initialAvailability={user?.isAvailable}
              onUpdate={() => window.location.reload()}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && <DonorProfile />}
            {activeTab === 'requests' && <DonorRequests />}
            {activeTab === 'drives' && <DonorBloodDrives />}
            {activeTab === 'history' && <DonationHistory />}
            {activeTab === 'locate' && <DonationWrapper />}
            {activeTab === 'support' && <DonorSupport />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to fetch data for map
const DonationWrapper = () => {
  const [requests, setRequests] = React.useState([]);

  React.useEffect(() => {
    import('../../services/requestService').then(service => {
      service.default.getDonorNotifications().then(data => setRequests(data));
    });
  }, []);

  return <LocateMap donations={requests} />;
}

export default DonorDashboard;
