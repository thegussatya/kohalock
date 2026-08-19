export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrl = apiUrl.startsWith('http') ? apiUrl.replace(/\/api$/, '') : '';
  const safePath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${safePath}`;
}
