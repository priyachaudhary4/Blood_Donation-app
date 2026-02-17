import axios from 'axios';

const API_URL = 'http://localhost:3000/api/admin';

const adminService = {
    getStats: async () => {
        const response = await axios.get(`${API_URL}/stats`, { withCredentials: true });
        return response.data.data;
    },

    getAllUsers: async () => {
        const response = await axios.get(`${API_URL}/users`, { withCredentials: true });
        return response.data.data;
    },

    deleteUser: async (id) => {
        const response = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
        return response.data;
    },

    notifyDonor: async (data) => {
        const response = await axios.post(`${API_URL}/notify`, data, { withCredentials: true });
        return response.data;
    },

    createBulkRequest: async (data) => {
        const response = await axios.post(`${API_URL}/bulk-request`, data, { withCredentials: true });
        return response.data;
    },

    getDonationRequests: async () => {
        const response = await axios.get(`${API_URL}/donation-requests`, { withCredentials: true });
        return response.data.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await axios.put(`${API_URL}/donation-requests/${id}/status`, { status }, { withCredentials: true });
        return response.data;
    }
};

export default adminService;
