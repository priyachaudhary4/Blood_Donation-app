import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const DonorNotificationsManager = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await adminService.getDonationRequests();
            setRequests(data);
        } catch (error) {
            toast.error('Failed to fetch donation requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'Completed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'Declined': return <XCircle className="w-5 h-5 text-gray-400" />;
            case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return 'bg-green-100 text-green-800 border-green-200';
            case 'Declined': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const filteredRequests = filter === 'All'
        ? requests
        : requests.filter(r => r.status === filter);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Donor Notification History</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded-md px-3 py-1.5 text-sm bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Completed">Completed</option>
                    <option value="Declined">Declined</option>
                </select>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No donation requests found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {req.donorId?.name || 'Unknown Donor'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {req.donorId?.phone || 'No Phone'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            {req.bloodType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={req.message}>
                                            {req.message || 'No message'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(req.status)}`}>
                                            {getStatusIcon(req.status)}
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(req.createdAt || req.requestDate).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {req.status === 'Accepted' && (
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Mark this donation as completed?')) {
                                                        try {
                                                            await adminService.updateRequestStatus(req._id, 'Completed');
                                                            toast.success('Donation marked as completed');
                                                            fetchRequests();
                                                        } catch (error) {
                                                            toast.error('Failed to update status');
                                                        }
                                                    }
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded border border-indigo-200"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DonorNotificationsManager;
