import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, Download, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import requestService from '../../services/requestService';
import bloodBankService from '../../services/bloodBankService';
import API from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import { generateRecipientCertificate } from '../../utils/certificateGenerator';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bankRequests, setBankRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      const [donorReqs, bankReqs] = await Promise.all([
        requestService.getMyRequests(),
        bloodBankService.getRequests()
      ]);
      setRequests(donorReqs);
      setBankRequests(bankReqs);
    } catch (error) {
      console.error(error);
      // toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReceived = async (id, type) => {
    try {
      if (type === 'donor') {
        // For donor requests, we use the complete endpoint
        await API.put(`/requests/${id}/complete`);
        toast.success('Donation marked as received!');
        fetchAllRequests();
      } else {
        // For blood bank requests, we might not have a direct 'complete' endpoint exposed for recipient
        // But let's check if we can add one or if status update works.
        // Assuming for now we can't easily change bank request status as recipient without backend change.
        // But user wants "recipient receives blood". 
        // We will simulate it visually or just allow download if approved.
        // If we want to persist "Received", we need backend support.
        // The current bloodBankController doesn't have a 'complete' for recipient.
        // So for Bank requests, we will just allow Certificate if status is 'approved'.
        toast.success('Marked as received locally.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleDownloadCertificate = (request, type) => {
    const recipientName = user.name;
    let donorName = '';
    let date = new Date();

    if (type === 'donor') {
      donorName = request.donorId?.name || 'Anonymous Donor';
      date = request.completedAt || request.updatedAt || new Date();
    } else {
      donorName = "LifeLink Blood Bank"; // Or specific hospital if available
      if (request.hospitalId && request.hospitalId.name) {
        // If request was fulfilled by a hospital (unlikely in this view as it's TO bank)
        // But if it was a bank request, it comes from stock.
      }
      date = request.resolvedDate || request.requestDate || new Date();
    }

    generateRecipientCertificate(recipientName, donorName, request.bloodType, date);
    toast.success('Certificate downloaded!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filterList = (list) => {
    if (filter === 'all') return list;
    return list.filter(req => req.status === filter);
  };

  const filteredDonorRequests = filterList(requests);
  const filteredBankRequests = filterList(bankRequests);

  if (loading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted/Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Section 1: Blood Bank Requests */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Requests to Blood Bank (Admin)</h3>
        {filteredBankRequests.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No requests to blood bank.</p>
        ) : (
          <div className="space-y-4">
            {filteredBankRequests.map((req) => (
              <div key={req._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(req.status)}
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">
                        Blood Bank Request
                      </h3>
                      <p className="text-xs text-gray-600">Urgency: <span className="font-bold uppercase">{req.urgency}</span></p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                  <div className="flex items-center text-gray-700">
                    <span className="font-bold mr-2">{req.unitsNeeded} units</span> of <span className="font-bold text-red-600 ml-1">{req.bloodType}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(req.requestDate).toLocaleDateString()} at {new Date(req.requestDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="col-span-2 flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    Central Blood Bank (Admin)
                  </div>
                </div>
                {/* Actions for Bank Requests */}
                <div className="mt-4 flex space-x-3 justify-end">
                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleDownloadCertificate(req, 'bank')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Direct Donor Requests */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Direct Requests to Donors</h3>
        {filteredDonorRequests.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No direct requests to donors.</p>
        ) : (
          <div className="space-y-4">
            {filteredDonorRequests.map((request) => (
              <div
                key={request._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">
                        To: {request.donorId?.name || 'Unknown Donor'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        Patient: {request.patientName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Blood:</span> <span className="font-bold text-red-600">{request.bloodType}</span> ({request.unitsNeeded} units)
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateTime(request.createdAt)}
                  </div>
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {request.location || request.donorId?.city || 'Location not specified'}
                </div>

                {request.status === 'accepted' && request.donorId && (
                  <div className="mt-2 p-3 bg-green-50 rounded border border-green-100 text-sm">
                    <p className="font-bold text-green-800 mb-1">Donor Contact Details:</p>
                    <p><strong>Phone:</strong> {request.donorId.phone}</p>
                    {request.donorId.address && (
                      <p><strong>Address:</strong> {request.donorId.address}, {request.donorId.city}</p>
                    )}
                  </div>
                )}

                {/* Actions for Donor Requests */}
                <div className="mt-4 flex space-x-3 justify-end border-t pt-3">
                  {request.status === 'accepted' && (
                    <button
                      onClick={() => handleMarkAsReceived(request._id, 'donor')}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Received</span>
                    </button>
                  )}

                  {request.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadCertificate(request, 'donor')}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
