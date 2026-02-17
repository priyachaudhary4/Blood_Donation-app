import API from './api';

const supportService = {
    // Donor: Create Message
    createMessage: async (message) => {
        const response = await API.post('/support', { message });
        return response.data;
    },

    // Donor: Get My Messages
    getMyMessages: async () => {
        const response = await API.get('/support/my');
        return response.data.data;
    },

    // Admin: Get All Messages
    getAllMessages: async () => {
        const response = await API.get('/support/admin');
        return response.data.data;
    },

    // Admin: Reply to Message
    replyToMessage: async (id, reply) => {
        const response = await API.put(`/support/admin/${id}/reply`, { reply });
        return response.data;
    }
};

export default supportService;
