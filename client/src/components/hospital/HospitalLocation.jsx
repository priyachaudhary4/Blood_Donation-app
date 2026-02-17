import { useState, useEffect } from 'react';
import { MapPin, Navigation, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const HospitalLocation = () => {
    const { user, checkUserLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        address: user?.address || '',
        city: user?.city || '',
    });
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                address: user.address || '',
                city: user.city || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Start basic reverse geocoding via OpenStreetMap Nominatim (free, no key required)
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || '';
                        const address = data.display_name || '';

                        setFormData(prev => ({
                            ...prev,
                            city,
                            address
                        }));
                        toast.success('Location updated from browser');
                    } else {
                        toast.error('Could not determine address from location');
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to get address details');
                } finally {
                    setGettingLocation(false);
                }
            },
            (error) => {
                console.error(error);
                toast.error('Unable to retrieve your location');
                setGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using JSON for updates where no file is involved
            // But since the route uses multer, we should be careful. 
            // Express middleware usually handles JSON body if multer doesn't intercept it fatally.
            // If multer is used globally or on route, it might expect multipart. 
            // However, typically multer just passes control if no file found in multipart, 
            // or if content-type is json it might skip (depending on implementation).
            // Safest to use FormData to match existing patterns.

            const formDataToSend = new FormData();
            formDataToSend.append('address', formData.address);
            formDataToSend.append('city', formData.city);

            await API.put('/users/profile', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await checkUserLoggedIn();
            toast.success('Location settings updated successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update location');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hospital Location Settings</h2>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <MapPin className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Updating your location helps donors find you easily. Ensure your address and city are accurate.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="e.g. New York"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Address
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter full hospital address"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={gettingLocation}
                        className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                    >
                        <Navigation className={`w-5 h-5 ${gettingLocation ? 'animate-spin' : ''}`} />
                        <span>{gettingLocation ? 'Getting Location...' : 'Use Current Location'}</span>
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Saving...' : 'Save Location'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HospitalLocation;
