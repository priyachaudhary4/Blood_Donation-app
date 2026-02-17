import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import { Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import requestService from '../../services/requestService';

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
        const s = status?.toLowerCase();
        switch (s) {
            case 'accepted': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'completed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'declined':
            case 'rejected': return <XCircle className="w-5 h-5 text-gray-400" />;
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
            case 'declined':
            case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredRequests = filter === 'All'
        ? requests
        : requests.filter(r => r.status?.toLowerCase() === filter.toLowerCase());

    if (loading) return <div className="p-8 text-center text-gray-500 italic">Finding donation history...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Donor Notification History</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and track all donation arrangements</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase">Filter</span>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-red-500 transition-all outline-none shadow-sm"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Completed">Completed</option>
                        <option value="Declined">Declined/Rejected</option>
                    </select>
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-24 px-6">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                        <AlertCircle className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No donation requests match your current filter.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/30 text-left border-b border-gray-100">
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Donor Details</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Type</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Message context</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Current Status</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date / Time</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredRequests.map((req) => {
                                const status = req.status?.toLowerCase();
                                return (
                                    <tr key={req._id} className="hover:bg-gray-50/80 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-sm ring-2 ring-white shadow-sm">
                                                    {(req.donorId?.name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-800">{req.donorId?.name || 'Unknown Donor'}</div>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 font-bold">
                                                        <Clock className="w-3 h-3" /> {req.donorId?.phone || 'No phone recorded'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-2.5 py-1 text-[10px] font-black rounded-md bg-red-50 text-red-600 ring-1 ring-inset ring-red-100">
                                                {req.bloodType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-xs text-gray-600 max-w-xs leading-relaxed" title={req.message}>
                                                {req.message ? (
                                                    <span className="italic">"{req.message.length > 60 ? req.message.substring(0, 60) + '...' : req.message}"</span>
                                                ) : (
                                                    <span className="text-gray-300 italic font-medium">No message attached</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 inline-flex items-center gap-2 text-[10px] font-bold rounded-full border shadow-sm transition-all ${getStatusColor(req.status)}`}>
                                                {getStatusIcon(req.status)}
                                                {req.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-[11px] text-gray-500 font-medium">
                                                {new Date(req.createdAt || req.requestDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {new Date(req.createdAt || req.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right space-x-2">
                                            {status === 'accepted' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Mark this donor response as reached and completed?')) {
                                                            try {
                                                                await adminService.updateRequestStatus(req._id, 'Completed');
                                                                toast.success('Response finalized');
                                                                fetchRequests();
                                                            } catch (error) {
                                                                toast.error('Update failed');
                                                            }
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    FINALIZE
                                                </button>
                                            )}
                                            {(status === 'completed' || status === 'declined' || status === 'rejected') ? (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Permanently remove this history record from the system?')) {
                                                            try {
                                                                console.log(`[ADMIN_CLEANUP] Deleting request ${req._id}`);
                                                                await requestService.deleteRequest(req._id);
                                                                toast.success('Record purged');
                                                                fetchRequests();
                                                            } catch (error) {
                                                                console.error('[ADMIN_CLEANUP_ERROR]', error);
                                                                toast.error(error.response?.data?.message || 'Delete failed');
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Purge record"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 uppercase italic">Locked</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DonorNotificationsManager;
