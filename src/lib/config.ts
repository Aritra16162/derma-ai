export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://derma-guide-api.onrender.com').replace(/\/$/, '');
// NEXT_PUBLIC_ variables are baked in at build time. For dynamic runtime toggling without rebuilding,
// use process.env.MAINTENANCE_MODE (without the NEXT_PUBLIC_ prefix).
export const ENABLE_MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === 'true';
