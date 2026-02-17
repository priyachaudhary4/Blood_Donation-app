import API from './api';

const bloodDriveService = {
    // Create a new drive (Admin/Hospital)
    createDrive: async (driveData) => {
        const response = await API.post('/drives', driveData);
        return response.data.data;
    },

    // Get all upcoming drives (Donor/Public)
    getUpcomingDrives: async () => {
        const response = await API.get('/drives');
        return response.data.data;
    },

    // Get My Drives (Organizer: Admin/Hospital)
    getMyDrives: async () => {
        const response = await API.get('/drives/my-drives');
        return response.data.data;
    },

    // Register for a drive (Donor)
    registerForDrive: async (driveId) => {
        const response = await API.put(`/drives/${driveId}/register`);
        return response.data;
    }
};

export default bloodDriveService;
