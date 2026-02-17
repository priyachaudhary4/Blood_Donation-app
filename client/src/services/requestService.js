import API from './api';

const requestService = {
  createRequest: async (requestData) => {
    const response = await API.post('/requests', requestData);
    return response.data.data;
  },

  getMyRequests: async () => {
    const response = await API.get('/requests/my-requests');
    return response.data.data;
  },

  getPendingRequests: async () => {
    const response = await API.get('/requests/pending');
    return response.data.data;
  },

  acceptRequest: async (requestId) => {
    const response = await API.put(`/requests/${requestId}/accept`);
    return response.data.data;
  },

  rejectRequest: async (requestId) => {
    const response = await API.put(`/requests/${requestId}/reject`);
    return response.data.data;
  },

  completeRequest: async (requestId) => {
    const response = await API.put(`/requests/${requestId}/complete`);
    return response.data.data;
  },

  emergencyBroadcast: async (broadcastData) => {
    const response = await API.post('/requests/emergency', broadcastData);
    return response.data;
  },

  getDonorNotifications: async () => {
    const response = await API.get('/donor/requests');
    return response.data.data;
  },

  updateDonorRequestStatus: async (requestId, status) => {
    const response = await API.put(`/donor/requests/${requestId}/status`, { status });
    return response.data.data;
  },

  deleteRequest: async (requestId) => {
    const response = await API.delete(`/requests/${requestId}`);
    return response.data;
  },
};

export default requestService;
