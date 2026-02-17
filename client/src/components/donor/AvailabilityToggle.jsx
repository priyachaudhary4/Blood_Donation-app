import { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AvailabilityToggle = ({ initialAvailability, onUpdate }) => {
  const [isAvailable, setIsAvailable] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);
  const { checkUserLoggedIn } = useAuth();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await API.put('/users/availability', {
        isAvailable: !isAvailable,
      });
      setIsAvailable(!isAvailable);
      await checkUserLoggedIn();
      if (onUpdate) onUpdate(!isAvailable);
      toast.success(`Status updated to ${!isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">
        Availability Status:
      </span>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          isAvailable ? 'bg-green-500' : 'bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAvailable ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
        {isAvailable ? 'Available' : 'Unavailable'}
      </span>
    </div>
  );
};

export default AvailabilityToggle;
