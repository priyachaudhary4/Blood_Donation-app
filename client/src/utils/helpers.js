import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
  };
  return colors[status?.toLowerCase()] || colors.pending;
};

export const getUrgencyColor = (urgency) => {
  const colors = {
    normal: 'text-blue-600',
    urgent: 'text-yellow-600',
    emergency: 'text-red-600 animate-pulse-urgent',
  };
  return colors[urgency?.toLowerCase()] || colors.normal;
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Use VITE_API_URL or default to localhost:3000
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};
