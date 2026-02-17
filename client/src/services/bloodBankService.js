import axios from 'axios';

const API_URL = 'http://localhost:3000/api/blood-bank';

const bloodBankService = {
    getStock: async () => {
        const response = await axios.get(`${API_URL}/stock`, { withCredentials: true });
        return response.data.data;
    },

    updateStock: async (data) => {
        const response = await axios.put(`${API_URL}/stock`, data, { withCredentials: true });
        return response.data.data;
    },

    createRequest: async (data) => {
        const response = await axios.post(`${API_URL}/requests`, data, { withCredentials: true });
        return response.data.data;
    },

    getRequests: async () => {
        const response = await axios.get(`${API_URL}/requests`, { withCredentials: true });
        return response.data.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await axios.put(`${API_URL}/requests/${id}`, { status }, { withCredentials: true });
        return response.data.data;
    },

    deleteRequest: async (id) => {
        const response = await axios.delete(`${API_URL}/requests/${id}`, { withCredentials: true });
        return response.data.data;
    },

    getDonorsByBloodType: async (bloodType) => {
        const encodedType = encodeURIComponent(bloodType);
        const response = await axios.get(`${API_URL}/donors/${encodedType}`, { withCredentials: true });
        return response.data.data;
    },

    // Helper to get list of potential donors for dropdown
    getPotentialDonors: async (bloodType) => {
        const encodedType = encodeURIComponent(bloodType);
        // We might need a new endpoint for this or just reuse a user search. 
        // For now, let's assume we can filter all donors. 
        // Actually, let's create a specific endpoint or use the existing user route if available.
        // Since I didn't create a specific endpoint for 'potential donors' (just 'units'), 
        // I'll add a quick endpoint or use `adminService` if it exists.
        // Let's check adminService first.
        return [];
    }
};

export default bloodBankService;
