import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Download, AlertCircle } from 'lucide-react';
import bloodBankService from '../../services/bloodBankService';
import { generateRecipientCertificate } from '../../utils/certificateGenerator';
import { useAuth } from '../../contexts/AuthContext';

const RequestBlood = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        bloodType: 'A+',
        unitsNeeded: 1,
        urgency: 'normal'
    });
    const [loading, setLoading] = useState(false);
    const [myRequests, setMyRequests] = useState([]);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const data = await bloodBankService.getRequests();
            setMyRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests');
        }
    };

    const handleDownloadCertificate = (request) => {
        const recipientName = user.name;
        const donorName = "LifeLink Blood Bank";
        const date = request.resolvedDate || request.requestDate || new Date();

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
            fetchMyRequests(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    Request Blood from Admin/Bank
                </h2>
                <p className="text-gray-600 mb-6">
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

            {/* Request History */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <h3 className="text-xl font-bold mb-4">Your Request History</h3>
                {myRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No blood bank requests made yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myRequests.map((req) => (
                                    <tr key={req._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.bloodType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.unitsNeeded}</td>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(req.requestDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {req.status === 'approved' && (
                                                <button
                                                    onClick={() => handleDownloadCertificate(req)}
                                                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    <span>Certificate</span>
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
        </div>
    );
};

export default RequestBlood;
