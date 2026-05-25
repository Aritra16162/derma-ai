export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://derma-guide-api.onrender.com').replace(/\/$/, '');
export const ENABLE_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
