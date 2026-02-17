import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import bloodBankService from '../../services/bloodBankService';

const HospitalRequestManager = () => {
    const [requests, setRequests] = useState([]);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        hospitalName: '',
        bloodType: 'A+',
        unitsNeeded: 1,
        urgency: 'normal',
        patientName: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchRequests(), fetchStock()]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const data = await bloodBankService.getRequests();
            setRequests(data);
        } catch (error) {
            toast.error('Failed to fetch requests');
        }
    };

    const fetchStock = async () => {
        try {
            const data = await bloodBankService.getStock();
            setStock(data);
        } catch (error) {
            console.error('Failed to fetch stock');
        }
    };

    const getAvailableUnits = (bloodType) => {
        const found = stock.find(s => s.bloodType === bloodType);
        return found ? found.quantity : 0;
    };

    const handleStatusUpdate = async (id, status, bloodType, unitsNeeded) => {
        if (status === 'approved') {
            const available = getAvailableUnits(bloodType);
            if (available < unitsNeeded) {
                alert(`Cannot Approve! Insufficient Stock.\n\nYou need ${unitsNeeded} units of ${bloodType}, but only have ${available}.\n\nPlease go to "Blood Stock" and add more units first.`);
                return;
            }
        }

        try {
            await bloodBankService.updateRequestStatus(id, status);
            toast.success(`Request ${status} successfully`);
            // Refresh data
            fetchRequests();
            fetchStock();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request history?')) return;
        try {
            await bloodBankService.deleteRequest(id);
            toast.success('Request history deleted');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to delete request');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await bloodBankService.createRequest(formData);
            toast.success('Request created successfully');
            setShowModal(false);
            setFormData({ hospitalName: '', bloodType: 'A+', unitsNeeded: 1, urgency: 'normal', patientName: '' });
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create request');
        }
    };

    if (loading && requests.length === 0) return <div>Loading requests...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Hospital Requests</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm"
                >
                    + Create Manual Request
                </button>
            </div>

            <div className="overflow-x-auto">
                {requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No hospital requests found. Create one manually!
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Check</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map(req => {
                                const available = getAvailableUnits(req.bloodType);
                                const isEnough = available >= req.unitsNeeded;
                                return (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{req.hospitalName || req.hospitalId?.hospitalName || 'Unknown'}</div>
                                            <div className="text-sm text-gray-500">{req.hospitalId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.bloodType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Needed: <span className="font-bold">{req.unitsNeeded}</span></div>
                                            <div className={`text-xs ${isEnough ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                                                Available: {available}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${req.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                                                    req.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {req.status === 'pending' ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleStatusUpdate(req._id, 'approved', req.bloodType, req.unitsNeeded)}
                                                        className={`hover:text-green-900 ${isEnough ? 'text-green-600' : 'text-gray-400 opacity-50 cursor-pointer'}`}
                                                        title={isEnough ? "Approve Request" : "Click to check stock"}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(req._id)}
                                                    className="text-gray-500 hover:text-red-600 text-xs border border-gray-300 px-2 py-1 rounded"
                                                    title="Remove from history"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create Manual Request</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hospital/Requester Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border rounded p-2"
                                    value={formData.hospitalName}
                                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={formData.bloodType}
                                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                >
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => {
                                        const qty = getAvailableUnits(t);
                                        return (
                                            <option key={t} value={t}>
                                                {t} {qty > 0 ? `✅ (${qty} units)` : '❌ (Out of Stock)'}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Units Needed</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full border rounded p-2"
                                    value={formData.unitsNeeded}
                                    onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Patient Name (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded p-2"
                                    value={formData.patientName}
                                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Button</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalRequestManager;
