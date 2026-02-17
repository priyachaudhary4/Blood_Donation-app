import { useState, useEffect } from 'react';
import { Search, Droplet, MapPin, User, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../services/api';
import { BLOOD_TYPES } from '../../utils/constants';
import SendRequest from './SendRequest';

const SearchDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bloodType: '',
    city: '',
  });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    searchDonors();
  }, []);

  const searchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.bloodType) params.append('bloodType', filters.bloodType);
      if (filters.city) params.append('city', filters.city);
      params.append('available', 'true');

      const response = await API.get(`/users/donors?${params.toString()}`);
      setDonors(response.data.data);
    } catch (error) {
      toast.error('Failed to search donors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchDonors();
  };

  const handleRequest = (donor) => {
    setSelectedDonor(donor);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    setSelectedDonor(null);
    searchDonors();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Available Donors</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type
            </label>
            <div className="relative">
              <Droplet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="bloodType"
                value={filters.bloodType}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Blood Types</option>
                {BLOOD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Search className="w-5 h-5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8">Loading donors...</div>
      ) : donors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No available donors found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <div
              key={donor._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{donor.name}</h3>
                  <p className="text-sm text-gray-600">{donor.city || 'Location not specified'}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Blood Type: {donor.bloodType}</span>
                </div>
                {donor.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{donor.city}</span>
                  </div>
                )}
                {donor.createdAt && (
                  <div className="flex items-center space-x-2 text-xs text-gray-400 pl-6">
                    <span>Joined: {new Date(donor.createdAt).toLocaleDateString()} {new Date(donor.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRequest(donor)}
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      )}

      {showRequestModal && selectedDonor && (
        <SendRequest
          donor={selectedDonor}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedDonor(null);
          }}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default SearchDonors;
