export const getImageUrl = (path) => {
  if (!path) return null;
  
  // Already a full URL (Cloudinary)
  if (path.startsWith('http')) return path;
  
  // Local path - add backend URL
  const backendUrl = import.meta.env.VITE_API_URL 
    || 'http://localhost:5000';
    
  return `${backendUrl}${path}`;
};