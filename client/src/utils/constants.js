export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal', color: 'blue' },
  { value: 'urgent', label: 'Urgent', color: 'yellow' },
  { value: 'emergency', label: 'Emergency', color: 'red' },
];

export const REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
};

export const NOTIFICATION_TYPES = {
  REQUEST: 'request',
  ACCEPTANCE: 'acceptance',
  REJECTION: 'rejection',
  COMPLETION: 'completion',
  EMERGENCY: 'emergency',
  INFO: 'info',
};
