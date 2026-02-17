import { useState, useEffect } from 'react';
import { CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import { formatDateTime, getStatusColor } from '../../utils/helpers';

const UpdateDonation = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (requestId) => {
    if (!window.confirm('Mark this donation as completed?')) {
      return;
    }
    try {
      await requestService.completeRequest(requestId);
      toast.success('Donation marked as completed');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update donation');
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.donorId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Update Donation Status</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient, donor, or blood type"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No requests found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Patient: {request.patientName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Donor: {request.donorId?.name} | Blood Type: {request.bloodType}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Units:</span>
                  <span className="font-semibold ml-2">{request.unitsNeeded}</span>
                </div>
                <div>
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-semibold ml-2">{request.recipientId?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold ml-2">{formatDateTime(request.createdAt)}</span>
                </div>
                {request.acceptedAt && (
                  <div>
                    <span className="text-gray-600">Accepted:</span>
                    <span className="font-semibold ml-2">{formatDateTime(request.acceptedAt)}</span>
                  </div>
                )}
              </div>

              {request.status === 'accepted' && (
                <button
                  onClick={() => handleComplete(request._id)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              )}

              {request.status === 'completed' && request.completedAt && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Completed on:</strong> {formatDateTime(request.completedAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdateDonation;
