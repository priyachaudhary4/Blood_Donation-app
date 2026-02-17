import API from './api';

const adminService = {
    getStats: async () => {
        const response = await API.get('/admin/stats');
        return response.data.data;
    },

    getAllUsers: async () => {
        const response = await API.get('/admin/users');
        return response.data.data;
    },

    deleteUser: async (id) => {
        const response = await API.delete(`/admin/users/${id}`);
        return response.data;
    },

    notifyDonor: async (data) => {
        const response = await API.post('/admin/notify', data);
        return response.data;
    },

    createBulkRequest: async (data) => {
        const response = await API.post('/admin/bulk-request', data);
        return response.data;
    },

    getDonationRequests: async () => {
        const response = await API.get('/admin/donation-requests');
        return response.data.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await API.put(`/admin/donation-requests/${id}/status`, { status });
        return response.data;
    }
};

export default adminService;
