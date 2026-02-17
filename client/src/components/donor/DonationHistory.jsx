import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import { generateCertificate } from '../../utils/certificateGenerator';
import { Award, Download, Calendar, Droplet, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DonationHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await requestService.getMyRequests();
            // Filter primarily for 'Completed' requests, which signify a successful donation
            const completedDonations = data.filter(req => req.status?.toLowerCase() === 'completed');
            setHistory(completedDonations);
        } catch (error) {
            toast.error('Failed to fetch donation history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = (donation) => {
        try {
            generateCertificate(user.name, user.bloodType, donation.requestDate, donation.patientName);
            toast.success('Certificate downloaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate certificate');
        }
    };

    const handleDelete = async (requestId) => {
        if (!window.confirm('Are you sure you want to remove this donation record from your history?')) return;
        try {
            await requestService.deleteRequest(requestId);
            toast.success('Record removed from history');
            fetchHistory();
        } catch (error) {
            toast.error('Failed to remove record');
        }
    };

    if (loading) return <div className="text-center py-8">Loading history...</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-red-600" />
                Donation History & Certificates
            </h2>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Droplet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">You haven't completed any donations yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Once you donate, your certificate will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {history.map((donation) => (
                        <div key={donation._id} className="border border-green-200 bg-green-50 rounded-lg p-5 hover:shadow-md transition relative group">
                            <button
                                onClick={() => handleDelete(donation._id)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 bg-white rounded-full shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove from History"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white p-2 rounded-full border border-green-100">
                                    <Droplet className="w-6 h-6 text-red-600" />
                                </div>
                                <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold uppercase">
                                    Completed
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1">Blood Donation</h3>
                            <div className="space-y-1 mb-4">
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(donation.requestDate).toLocaleDateString()}
                                </div>
                                {donation.patientName && (
                                    <div className="text-sm text-gray-600 font-medium">
                                        For Patient: {donation.patientName}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDownloadCertificate(donation)}
                                className="w-full bg-white border border-green-600 text-green-700 py-2 rounded-md font-semibold hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Certificate
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonationHistory;
