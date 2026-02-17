import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, User, Calendar, MapPin, CheckCircle, Clock, XCircle, AlertCircle, Droplet, Phone, Trash2, PlusCircle } from 'lucide-react';
import bloodBankService from '../../services/bloodBankService';
import requestService from '../../services/requestService';
import { generateRecipientCertificate } from '../../utils/certificateGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const RequestBlood = () => {
    const { user } = useAuth();
    const [bankRequests, setBankRequests] = useState([]);
    const [donorRequests, setDonorRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('bank');
    const [formData, setFormData] = useState({
        bloodType: 'A+',
        unitsNeeded: 1,
        urgency: 'normal',
        patientName: ''
    });

    useEffect(() => {
        fetchAllRequests();
    }, []);

    const fetchAllRequests = async () => {
        try {
            const [bankData, donorData] = await Promise.all([
                bloodBankService.getRequests(),
                requestService.getMyRequests()
            ]);
            setBankRequests(bankData);
            setDonorRequests(donorData);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await bloodBankService.createRequest(formData);
            toast.success('Request submitted successfully');
            setFormData({
                bloodType: 'A+',
                unitsNeeded: 1,
                urgency: 'normal',
                patientName: ''
            });
            fetchAllRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    const handleDownloadCertificate = (request, type) => {
        const recipientName = user.hospitalName || user.name;
        let donorName = '';
        let date = new Date();

        if (type === 'donor') {
            donorName = request.donorId?.name || 'Anonymous Donor';
            date = request.completedAt || request.updatedAt || new Date();
        } else {
            donorName = "LifeLink Blood Bank";
            date = request.resolvedDate || request.requestDate || new Date();
        }

        generateRecipientCertificate(recipientName, donorName, request.bloodType, date, request.patientName);
        toast.success('Certificate downloaded!');
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'accepted':
            case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'completed': return <CheckCircle className="w-5 h-5 text-blue-600" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your activity...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Request Form - Improved styling */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-red-600" />
                    Request Blood from Bank
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Type</label>
                        <select
                            className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-lg text-sm transition-all"
                            value={formData.bloodType}
                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Units Needed</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 rounded-lg text-sm transition-all"
                            value={formData.unitsNeeded}
                            onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                        />
                    </div>

                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Urgency</label>
                        <select
                            className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 rounded-lg text-sm transition-all"
                            value={formData.urgency}
                            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <div className="flex-[2] min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                        <input
                            type="text"
                            placeholder="Optional: Name of patient"
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-red-500 rounded-lg text-sm transition-all"
                            value={formData.patientName}
                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-red-700 active:transform active:scale-95 transition-all shadow-md flex items-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Submit Request
                    </button>
                </form>
            </div>

            {/* 2-Column Activity Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Blood Bank Requests */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <Droplet className="w-5 h-5" />
                            Blood Bank Deliveries
                            <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs font-mono">
                                {bankRequests.filter(r => r.status?.toLowerCase() !== 'completed').length} Active
                            </span>
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        {bankRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 italic">No bank requests yet.</p>
                            </div>
                        ) : (
                            bankRequests.map((request) => (
                                <div key={request._id} className={`p-5 hover:bg-red-50/50 transition-colors ${request.status?.toLowerCase() === 'approved' ? 'bg-red-50/30 ring-1 ring-inset ring-red-100' : ''}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`p-1.5 rounded-lg ${request.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {request.bloodType} ({request.unitsNeeded} Units)
                                                </h4>
                                            </div>
                                            <div className="flex flex-col gap-1.5 ml-9 text-xs">
                                                <span className="flex items-center text-gray-500">
                                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                                                    Urgency: <strong className="ml-1 uppercase">{request.urgency}</strong>
                                                </span>
                                                {request.patientName && (
                                                    <span className="flex items-center text-gray-700 font-medium italic">
                                                        Patient: {request.patientName}
                                                    </span>
                                                )}
                                                <span className="flex items-center text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                    {formatDateTime(request.requestDate)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(request.status)} ring-1 ring-inset ring-current/20`}>
                                                {request.status}
                                            </span>

                                            {request.status?.toLowerCase() === 'approved' && (
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Mark this blood bank delivery as received?')) {
                                                            try {
                                                                await bloodBankService.completeRequest(request._id);
                                                                toast.success('Received! Stock verified.');
                                                                fetchAllRequests();
                                                            } catch (e) {
                                                                toast.error(e.response?.data?.message || 'Action failed');
                                                            }
                                                        }
                                                    }}
                                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Mark Received
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {(request.status?.toLowerCase() === 'completed' || request.status?.toLowerCase() === 'rejected') && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Remove from history?')) {
                                                        try {
                                                            await bloodBankService.deleteRequest(request._id);
                                                            toast.success('Deleted');
                                                            fetchAllRequests();
                                                        } catch (e) { toast.error('Error'); }
                                                    }
                                                }}
                                                className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 font-bold"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Column 2: Direct Donor Requests */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Direct Donor Matches
                            <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs font-mono">
                                {donorRequests.filter(r => r.status?.toLowerCase() !== 'completed').length} Active
                            </span>
                        </h3>
                    </div>

                    <div className="divide-y divide-gray-50 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        {donorRequests.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 italic">No donor requests yet.</p>
                            </div>
                        ) : (
                            donorRequests.map((request) => (
                                <div key={request._id} className={`p-5 hover:bg-blue-50/50 transition-colors ${request.status?.toLowerCase() === 'accepted' ? 'bg-green-50/40 ring-1 ring-inset ring-green-100' : ''}`}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`p-1.5 rounded-lg ${request.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {getStatusIcon(request.status)}
                                                </div>
                                                <h4 className="font-bold text-gray-900 truncate">
                                                    {request.donorId?.name || 'Waiting for Donor...'}
                                                </h4>
                                            </div>
                                            <div className="flex flex-col gap-1.5 ml-9 text-xs">
                                                <span className="flex items-center text-gray-600 font-bold">
                                                    <Droplet className="w-3.5 h-3.5 mr-1.5 text-red-500" />
                                                    {request.bloodType} ({request.unitsNeeded} units)
                                                </span>
                                                <span className="text-gray-500 font-medium">Patient: {request.patientName}</span>
                                                <span className="text-[10px] text-gray-400">{formatDateTime(request.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(request.status)} ring-1 ring-inset ring-current/20`}>
                                                {request.status}
                                            </span>
                                        </div>
                                    </div>

                                    {request.status?.toLowerCase() === 'accepted' && (
                                        <div className="mt-4 ml-9 p-3 bg-white rounded-lg border border-green-200 shadow-sm space-y-3">
                                            <div className="flex items-center gap-2 text-[11px] text-green-700 font-bold">
                                                <CheckCircle className="w-3.5 h-3.5" /> Donor Ready!
                                            </div>
                                            <div className="grid grid-cols-1 gap-1 text-[10px] text-gray-600 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3" /> {request.donorId?.phone}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> {request.donorId?.city}
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Confirm receipt of blood from donor?')) {
                                                        try {
                                                            await requestService.completeRequest(request._id);
                                                            toast.success('Completed! Certificate issued.');
                                                            fetchAllRequests();
                                                        } catch (e) {
                                                            toast.error(e.response?.data?.message || 'Failed');
                                                        }
                                                    }
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-[11px] font-black rounded-lg hover:bg-green-700 shadow-md transition-all active:scale-95"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Confirm Received
                                            </button>
                                        </div>
                                    )}

                                    {(request.status?.toLowerCase() === 'completed' || request.status?.toLowerCase() === 'rejected') && (
                                        <div className="mt-4 flex justify-between items-center ml-9">
                                            {request.status?.toLowerCase() === 'completed' && (
                                                <button
                                                    onClick={() => handleDownloadCertificate(request, 'donor')}
                                                    className="flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded text-[10px] font-bold"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Certificate
                                                </button>
                                            )}
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Remove record?')) {
                                                        try {
                                                            await requestService.deleteRequest(request._id);
                                                            toast.success('Deleted');
                                                            fetchAllRequests();
                                                        } catch (e) { toast.error('Error'); }
                                                    }
                                                }}
                                                className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 font-bold ml-auto"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestBlood;
