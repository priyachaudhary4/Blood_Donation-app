import React, { useState } from 'react';

import AllDonors from './AllDonors';
import EmergencyBroadcast from './EmergencyBroadcast';
import UpdateDonation from './UpdateDonation';
import RequestBlood from './RequestBlood';
import HospitalProfile from './HospitalProfile';
import HospitalLocation from './HospitalLocation';
import HospitalBloodDrives from './HospitalBloodDrives';
import { Users, AlertTriangle, CheckCircle, Droplet, User, Map, Calendar } from 'lucide-react';

const HospitalDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Hospital Profile', icon: User },
    { id: 'location', label: 'Location', icon: Map },
    { id: 'donors', label: 'All Donors', icon: Users },
    { id: 'drives', label: 'Blood Drives', icon: Calendar },
    { id: 'emergency', label: 'Emergency Broadcast', icon: AlertTriangle },
    { id: 'donations', label: 'Update Donations', icon: CheckCircle },
    { id: 'requests', label: 'Blood Requests', icon: Droplet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage all donors and coordinate blood donations</p>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${activeTab === tab.id
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
            {activeTab === 'profile' && <HospitalProfile />}
            {activeTab === 'location' && <HospitalLocation />}
            {activeTab === 'donors' && <AllDonors />}
            {activeTab === 'drives' && <HospitalBloodDrives />}
            {activeTab === 'emergency' && <EmergencyBroadcast />}
            {activeTab === 'donations' && <UpdateDonation />}
            {activeTab === 'requests' && <RequestBlood />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
