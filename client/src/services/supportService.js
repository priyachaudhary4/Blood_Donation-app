import API from './api';

const supportService = {
    // Send a new message
    createMessage: async (message) => {
        const response = await API.post('/support', { message });
        return response.data.data;
    },

    // Get my conversation history
    getMyMessages: async () => {
        const response = await API.get('/support/my');
        return response.data.data;
    },

    // Admin: Get all messages
    getAllMessages: async () => {
        const response = await API.get('/support/admin');
        return response.data.data;
    },

    // Admin: Reply to a message
    replyToMessage: async (id, reply) => {
        const response = await API.put(`/support/admin/${id}/reply`, { reply });
        return response.data.data;
    }
};

export default supportService;
