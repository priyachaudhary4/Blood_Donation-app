import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import bloodDriveService from '../../services/bloodDriveService';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DonorBloodDrives = () => {
    const { user } = useAuth();
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const data = await bloodDriveService.getUpcomingDrives();
            setDrives(data);
        } catch (error) {
            toast.error('Failed to fetch blood drives');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (driveId) => {
        try {
            await bloodDriveService.registerForDrive(driveId);
            toast.success('Successfully registered for the blood drive!');
            fetchDrives(); // Refresh to update status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register');
        }
    };

    const isRegistered = (drive) => {
        return drive.attendees.some(attendee => attendee.donorId === user._id);
    };

    if (loading) return <div className="text-center py-8">Loading blood drives...</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-red-600" />
                Upcoming Blood Donation Drives
            </h2>

            {drives.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No upcoming blood drives found.</p>
                    <p className="text-gray-400">Check back later for new events!</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drives.map((drive) => (
                        <div key={drive._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 truncate" title={drive.title}>
                                        {drive.title}
                                    </h3>
                                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                                        Upcoming
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                    {drive.description || 'Join us to save lives!'}
                                </p>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-red-500" />
                                        <span className="font-medium">{new Date(drive.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-red-500" />
                                        <span>{drive.startTime} - {drive.endTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" />
                                        <span className="truncate">{drive.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-red-500" />
                                        <span>Organized by: {drive.organizerId?.name || drive.organizerId?.hospitalName || 'LifeLink'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                {isRegistered(drive) ? (
                                    <button
                                        disabled
                                        className="w-full bg-green-100 text-green-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-default"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Registered
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleRegister(drive._id)}
                                        className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                                    >
                                        Register Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonorBloodDrives;
