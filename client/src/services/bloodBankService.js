import API from './api';

const bloodBankService = {
    getStock: async () => {
        const response = await API.get('/blood-bank/stock');
        return response.data.data;
    },

    updateStock: async (data) => {
        const response = await API.put('/blood-bank/stock', data);
        return response.data.data;
    },

    createRequest: async (data) => {
        const response = await API.post('/blood-bank/requests', data);
        return response.data.data;
    },

    getRequests: async () => {
        const response = await API.get('/blood-bank/requests');
        return response.data.data;
    },

    updateRequestStatus: async (id, status) => {
        const response = await API.put(`/blood-bank/requests/${id}`, { status });
        return response.data.data;
    },

    deleteRequest: async (id) => {
        const response = await API.delete(`/blood-bank/requests/${id}`);
        return response.data.data;
    },

    getDonorsByBloodType: async (bloodType) => {
        const encodedType = encodeURIComponent(bloodType);
        const response = await API.get(`/blood-bank/donors/${encodedType}`);
        return response.data.data;
    },

    getPotentialDonors: async (bloodType) => {
        return [];
    }
};

export default bloodBankService;
