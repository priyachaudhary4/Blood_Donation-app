import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import bloodDriveService from '../../services/bloodDriveService';
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const RequestSessionManager = () => {
    const [drives, setDrives] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        bloodTypes: ['All']
    });

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const data = await bloodDriveService.getMyDrives(); // Get drives organized by Admin
            setDrives(data);
        } catch (error) {
            toast.error('Failed to fetch drives');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await bloodDriveService.createDrive({
                ...formData,
                bloodTypes: formData.bloodTypes.includes('All') ? ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] : formData.bloodTypes
            });
            toast.success('Blood Donation Drive Created & Published!');
            setShowForm(false);
            setFormData({
                title: '',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                description: '',
                bloodTypes: ['All']
            });
            fetchDrives();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create drive');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-red-600" />
                    Blood Donation Drives
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    {showForm ? 'Cancel' : 'Schedule New Drive'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
                    <h3 className="text-xl font-semibold mb-4">Schedule New Drive</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Drive Title</label>
                            <input
                                name="title"
                                required
                                placeholder="e.g. City Center Mega Camp"
                                className="w-full input-field"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full input-field"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                    <input
                                        name="location"
                                        required
                                        placeholder="Address / Venue"
                                        className="w-full pl-10 input-field"
                                        value={formData.location}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    required
                                    className="w-full input-field"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    required
                                    className="w-full input-field"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                            <textarea
                                name="description"
                                rows="3"
                                placeholder="Describe the event..."
                                className="w-full input-field"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            {loading ? 'Publishing...' : 'Publish Drive'}
                        </button>
                    </form>
                </div>
            )}

            {/* List of Drives */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {drives.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg shadow">
                        No active blood drives found. Schedule one above!
                    </div>
                )}
                {drives.map((drive) => (
                    <div key={drive._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                        <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate" title={drive.title}>
                                {drive.title}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-red-500" />
                                    {new Date(drive.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-red-500" />
                                    {drive.startTime} - {drive.endTime}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span className="truncate">{drive.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
                            <div className="flex items-center gap-1 font-medium text-gray-700">
                                <Users className="w-4 h-4" />
                                {drive.attendees?.length || 0} Registered
                            </div>
                            <button
                                onClick={() => setSelectedDrive(selectedDrive === drive._id ? null : drive._id)}
                                className="text-red-600 hover:text-red-800 font-medium text-xs"
                            >
                                {selectedDrive === drive._id ? 'Hide Details' : 'View Attendees'}
                            </button>
                        </div>

                        {/* Attendees List Expansion */}
                        {selectedDrive === drive._id && (
                            <div className="bg-gray-50 px-5 pb-5 border-t border-gray-200">
                                <h4 className="text-sm font-bold text-gray-800 mt-3 mb-2">Registered Attendees</h4>
                                {drive.attendees && drive.attendees.length > 0 ? (
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {drive.attendees.map((attendee, index) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded border border-gray-200 text-xs">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{attendee.donorId?.name || 'Unknown'}</p>
                                                    <p className="text-gray-500">{attendee.donorId?.email}</p>
                                                </div>
                                                <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                                                    {attendee.donorId?.bloodType}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No attendees registered yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RequestSessionManager;
