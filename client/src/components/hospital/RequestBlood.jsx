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

            {/* Blood Bank Requests List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-bold text-gray-900">Requests to Blood Bank</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {bankRequests.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 italic">No requests to blood bank</div>
                    ) : (
                        bankRequests.map((request) => (
                            <div key={request._id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(request.status)}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-900">
                                                {request.bloodType} - {request.unitsNeeded} Unit(s)
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Urgency: <span className="font-bold uppercase">{request.urgency}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {request.status === 'approved' && (
                                            <button
                                                onClick={() => handleDownloadCertificate(request, 'bank')}
                                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Certificate</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-500 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Requested: {formatDateTime(request.requestDate)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Direct Donor Requests List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-bold text-gray-900">Direct Requests to Donors</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {donorRequests.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 italic">No direct requests to donors</div>
                    ) : (
                        donorRequests.map((request) => (
                            <div key={request._id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(request.status)}
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                                                To: {request.donorId?.name || 'Unknown Donor'}
                                                <User className="w-4 h-4 text-gray-400" />
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                Patient: {request.patientName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        {request.status === 'completed' && (
                                            <button
                                                onClick={() => handleDownloadCertificate(request, 'donor')}
                                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Certificate</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <span className="font-bold text-red-600 mr-1">{request.bloodType}</span>
                                        <span>({request.unitsNeeded} units)</span>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDateTime(request.createdAt)}
                                    </div>
                                    {request.status === 'accepted' && request.donorId && (
                                        <div className="col-span-2 mt-2 bg-green-50 p-2 rounded text-xs">
                                            <span className="font-bold">Contact:</span> {request.donorId.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestBlood;
