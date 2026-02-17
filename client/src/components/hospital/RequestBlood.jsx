import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, User, Calendar, MapPin, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
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
    const [formData, setFormData] = useState({
        bloodType: 'A+',
        unitsNeeded: 1,
        urgency: 'normal'
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
                urgency: 'normal'
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

        generateRecipientCertificate(recipientName, donorName, request.bloodType, date);
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

    if (loading) return <div className="text-center py-8">Loading requests...</div>;

    return (
        <div className="space-y-8">
            {/* Request Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Request Blood from Bank</h2>
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                        <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.bloodType}
                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        >
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Units Needed</label>
                        <input
                            type="number"
                            min="1"
                            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.unitsNeeded}
                            onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Urgency</label>
                        <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={formData.urgency}
                            onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Submit Request
                    </button>
                </form>
            </div>

            {/* Combined Active Requests Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Active Requests & Current Activity</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {bankRequests.length === 0 && donorRequests.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 italic font-medium">No active requests found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Bank Requests first if they exist */}
                            {bankRequests.map((request) => (
                                <div key={request._id} className="p-6 hover:bg-red-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-red-100 rounded-full">
                                                {getStatusIcon(request.status)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                                    Blood Bank: {request.bloodType} ({request.unitsNeeded} Units)
                                                </h4>
                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    Urgency: <span className={`ml-1 font-bold uppercase ${request.urgency === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>{request.urgency}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                            {request.status === 'approved' && (
                                                <button
                                                    onClick={() => handleDownloadCertificate(request, 'bank')}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 shadow-sm transition"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Certificate
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pl-14 text-sm text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Request placed on {formatDateTime(request.requestDate)}
                                    </div>
                                </div>
                            ))}

                            {/* Donor Requests */}
                            {donorRequests.map((request) => (
                                <div key={request._id} className={`p-6 hover:bg-blue-50 transition-colors ${request.status === 'accepted' ? 'bg-green-50' : ''}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${request.status === 'accepted' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                {getStatusIcon(request.status)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                                    Donor: {request.donorId?.name || 'Anonymous Donor'}
                                                </h4>
                                                <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <Droplet className="w-4 h-4 mr-1 text-red-600" />
                                                        <strong>{request.bloodType}</strong> ({request.unitsNeeded} units)
                                                    </span>
                                                    <span className="flex items-center">
                                                        <User className="w-4 h-4 mr-1 text-gray-400" />
                                                        Patient: {request.patientName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-4 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusColor(request.status)}`}>
                                                {request.status.toUpperCase()}
                                            </span>
                                            {request.status === 'completed' && (
                                                <button
                                                    onClick={() => handleDownloadCertificate(request, 'donor')}
                                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 shadow-sm transition"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Certificate
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prominent Accepted Details */}
                                    {request.status === 'accepted' && request.donorId && (
                                        <div className="mt-4 ml-14 p-4 bg-white rounded-xl border-2 border-green-200 shadow-sm">
                                            <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                                                <CheckCircle className="w-5 h-5" />
                                                Great news! Donor has accepted the request.
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center text-gray-700">
                                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                    <strong>Phone:</strong> <span className="ml-1">{request.donorId.phone}</span>
                                                </div>
                                                <div className="flex items-center text-gray-700">
                                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                    <strong>Location:</strong> <span className="ml-1">{request.donorId.address}, {request.donorId.city}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 pl-14 text-sm text-gray-500 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Sent on {formatDateTime(request.createdAt)}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestBlood;
