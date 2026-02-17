import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import { generateCertificate } from '../../utils/certificateGenerator';
import { Award, Download, Calendar, Droplet } from 'lucide-react';
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
            const data = await requestService.getDonorNotifications();
            // Filter primarily for 'Completed' requests, which signify a successful donation
            // For demo purposes, we might also include 'Accepted' if not yet marked complete
            const completedDonations = data.filter(req => req.status === 'Completed');
            setHistory(completedDonations);
        } catch (error) {
            toast.error('Failed to fetch donation history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = (donation) => {
        try {
            generateCertificate(user.name, user.bloodType, donation.requestDate);
            toast.success('Certificate downloaded!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate certificate');
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
                        <div key={donation._id} className="border border-green-200 bg-green-50 rounded-lg p-5 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-white p-2 rounded-full border border-green-100">
                                    <Droplet className="w-6 h-6 text-red-600" />
                                </div>
                                <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold uppercase">
                                    Completed
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-800 text-lg mb-1">Blood Donation</h3>
                            <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(donation.requestDate).toLocaleDateString()}
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
