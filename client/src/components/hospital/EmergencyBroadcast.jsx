import { useState } from 'react';
import { AlertTriangle, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import { BLOOD_TYPES, URGENCY_LEVELS } from '../../utils/constants';

const EmergencyBroadcast = () => {
  const [formData, setFormData] = useState({
    bloodType: '',
    city: '',
    patientName: '',
    unitsNeeded: 1,
    message: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await requestService.emergencyBroadcast({
        ...formData,
        unitsNeeded: parseInt(formData.unitsNeeded),
      });
      toast.success(result.message || 'Emergency broadcast sent successfully');
      setFormData({
        bloodType: '',
        city: '',
        patientName: '',
        unitsNeeded: 1,
        message: '',
        contactPhone: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send emergency broadcast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency Blood Broadcast</h2>
          <p className="text-sm text-gray-600">Send urgent request to all matching donors</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Type *
            </label>
            <select
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City (Optional)
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Filter by city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name *
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units Needed *
            </label>
            <input
              type="number"
              name="unitsNeeded"
              value={formData.unitsNeeded}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Emergency contact number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the emergency situation..."
            />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Warning:</p>
              <p>This will send an emergency notification to ALL available donors matching your criteria. Use this feature only for genuine emergencies.</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
        >
          <Send className="w-5 h-5" />
          <span>{loading ? 'Sending Broadcast...' : 'Send Emergency Broadcast'}</span>
        </button>
      </form>
    </div>
  );
};

export default EmergencyBroadcast;
