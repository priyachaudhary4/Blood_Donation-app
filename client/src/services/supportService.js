import axios from 'axios';

const API_URL = 'http://localhost:3000/api/support';

const supportService = {
    // Donor: Create Message
    createMessage: async (message) => {
        const response = await axios.post(API_URL, { message }, { withCredentials: true });
        return response.data;
    },

    // Donor: Get My Messages
    getMyMessages: async () => {
        const response = await axios.get(`${API_URL}/my`, { withCredentials: true });
        return response.data.data;
    },

    // Admin: Get All Messages
    getAllMessages: async () => {
        const response = await axios.get(`${API_URL}/admin`, { withCredentials: true });
        return response.data.data;
    },

    // Admin: Reply to Message
    replyToMessage: async (id, reply) => {
        const response = await axios.put(`${API_URL}/admin/${id}/reply`, { reply }, { withCredentials: true });
        return response.data;
    }
};

export default supportService;
