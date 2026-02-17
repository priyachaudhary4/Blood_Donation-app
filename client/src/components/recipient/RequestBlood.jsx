import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, AlertCircle, Clock, CheckCircle, XCircle, Calendar, User, Phone, MapPin, Droplet } from 'lucide-react';
import bloodBankService from '../../services/bloodBankService';
import requestService from '../../services/requestService';
import { generateRecipientCertificate } from '../../utils/certificateGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const RequestBlood = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        bloodType: 'A+',
        unitsNeeded: 1,
        urgency: 'normal'
    });
    const [loading, setLoading] = useState(false);
    const [bankRequests, setBankRequests] = useState([]);
    const [donorRequests, setDonorRequests] = useState([]);

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
            console.error('Failed to fetch requests');
        }
    };

    const handleDownloadCertificate = (request, type) => {
        const recipientName = user.name;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await bloodBankService.createRequest(formData);
            toast.success('Request sent to Blood Bank successfully!');
            setFormData({ bloodType: 'A+', unitsNeeded: 1, urgency: 'normal' });
            fetchAllRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    Request Blood from Admin/Bank
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                    Directly request blood units from the central blood bank stock. The Admin will review and approve your request.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type Needed</label>
                            <select
                                className="w-full border rounded-lg p-3"
                                value={formData.bloodType}
                                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                            >
                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Units (Bags)</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                required
                                className="w-full border rounded-lg p-3"
                                value={formData.unitsNeeded}
                                onChange={(e) => setFormData({ ...formData, unitsNeeded: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                            <select
                                className="w-full border rounded-lg p-3"
                                value={formData.urgency}
                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending Request...' : 'Submit Request to Blood Bank'}
                    </button>
                </form>
            </div>

            {/* Combined Activity Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Your Current Requests & Activity</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {bankRequests.length === 0 && donorRequests.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500 italic">
                            No active requests found.
                        </div>
                    ) : (
                        <>
                            {/* Bank Requests */}
                            {bankRequests.map((req) => (
                                <div key={req._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-red-50 rounded-full">
                                                {getStatusIcon(req.status)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    Bank: {req.bloodType} ({req.unitsNeeded} Units)
                                                </h4>
                                                <div className="flex items-center mt-1 text-sm text-gray-500 font-medium">
                                                    Status: <span className={`ml-1 uppercase ${req.status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>{req.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {req.status === 'approved' && (
                                            <button
                                                onClick={() => handleDownloadCertificate(req, 'bank')}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 shadow-sm transition"
                                            >
                                                <Download className="w-4 h-4" />
                                                Certificate
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-4 pl-14 text-xs text-gray-400">
                                        Placed on {new Date(req.requestDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}

                            {/* Donor Requests */}
                            {donorRequests.map((req) => (
                                <div key={req._id} className={`p-6 transition-colors ${req.status?.toLowerCase() === 'accepted' ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${req.status === 'accepted' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                {getStatusIcon(req.status)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                                    Donor: {req.donorId?.name || 'Potential Donor'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-sm">
                                                    <Droplet className="w-4 h-4 text-red-600" />
                                                    <strong>{req.bloodType}</strong> ({req.unitsNeeded} Units)
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${getStatusColor(req.status)}`}>
                                            {req.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {req.status?.toLowerCase() === 'accepted' && req.donorId && (
                                        <div className="mt-4 ml-14 p-4 bg-white rounded-xl border-2 border-green-200">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <p className="text-green-800 font-bold text-sm mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Donor Details Attached!
                                                    </p>
                                                    <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                                                        <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {req.donorId.phone}</div>
                                                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {req.donorId.city}</div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Did you receive the blood from this donor? This will finalize the request and issue a certificate to the donor.')) {
                                                            try {
                                                                await requestService.completeRequest(req._id);
                                                                toast.success('Thank you! Donation marked as received.');
                                                                fetchAllRequests();
                                                            } catch (e) {
                                                                toast.error(e.response?.data?.message || 'Failed to complete request');
                                                            }
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition text-xs"
                                                >
                                                    Mark as Received
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {req.status === 'completed' && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleDownloadCertificate(req, 'donor')}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700"
                                            >
                                                <Download className="w-4 h-4" /> Download Certificate
                                            </button>
                                        </div>
                                    )}
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
