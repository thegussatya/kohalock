export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  // Ambil baseURL dari env, jika tidak ada asumsikan localhost:3000
  // Biasanya import.meta.env.VITE_API_URL bernilai "http://localhost:3000/api"
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  // Karena path biasanya seperti "/uploads/filename.ext", kita butuh domain aslinya tanpa "/api"
  const baseUrl = apiUrl.replace(/\/api$/, '');
  
  // Pastikan path diawali dengan slash
  const safePath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${safePath}`;
}
