import API from './api';

const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data.data;
  },

  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data.data;
  },

  logout: async () => {
    await API.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data.data;
  },

  refreshToken: async () => {
    await API.post('/auth/refresh');
  },
};

export default authService;
