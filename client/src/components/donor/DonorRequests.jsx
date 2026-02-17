import { useState, useEffect } from 'react';
import { Bell, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import { formatDateTime } from '../../utils/helpers';

const DonorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getDonorNotifications();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await requestService.updateDonorRequestStatus(requestId, newStatus);
      toast.success(`Request ${newStatus}`);
      fetchRequests(); // Refresh list
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Donation Notifications</h2>

      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No new notifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className={`border rounded-lg p-4 transition ${request.status?.trim().toLowerCase() === 'pending' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className={`w-5 h-5 ${request.status?.trim().toLowerCase() === 'pending' ? 'text-red-600' : 'text-gray-500'}`} />
                    Blood Donation Request
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Requested by: <span className="font-semibold">
                      {request.hospitalId?.hospitalName || request.hospitalId?.name || request.recipientId?.name || request.requesterId?.name || 'System Admin'}
                    </span>
                  </p>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDateTime(request.requestDate)}
                </div>
              </div>

              <div className="mb-3">
                <div className="inline-block bg-white border border-gray-200 px-3 py-1 rounded font-bold text-sm">
                  {request.bloodType} Needed
                </div>
              </div>

              {request.message && (
                <div className="p-3 bg-white rounded border border-gray-100 italic text-gray-600 space-y-2">
                  <div className="whitespace-pre-wrap">{request.message}</div>

                  {request.type === 'Drive' && request.scheduledDate && (
                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-bold text-gray-700 block">Date:</span>
                        {new Date(request.scheduledDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-bold text-gray-700 block">Time:</span>
                        {request.startTime} - {request.endTime}
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold text-gray-700 block">Location:</span>
                        {request.location}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-between items-center border-t pt-3">
                <span className={`text-xs px-2 py-1 rounded font-semibold ${request.status?.trim().toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status?.trim().toLowerCase() === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  Status: {request.status}
                </span>

                {request.status?.trim().toLowerCase() === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'Accepted')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'Declined')}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorRequests;
