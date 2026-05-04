export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

if (typeof window !== 'undefined' && API_URL.includes('127.0.0.1') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.error("CRITICAL ERROR: NEXT_PUBLIC_API_URL is not set in Vercel environment variables.");
  setTimeout(() => {
    alert("Configuration Error: NEXT_PUBLIC_API_URL is missing in Vercel settings. The app is trying to connect to localhost.");
  }, 1000);
}
