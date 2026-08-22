export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const baseUrl = apiUrl.startsWith('http') ? apiUrl.replace(/\/api$/, '') : '';
  
  let safePath = path.startsWith('/') ? path : `/${path}`;
  if (safePath.startsWith('/uploads') && !safePath.startsWith('/api/uploads')) {
    safePath = `/api${safePath}`;
  }
  
  return `${baseUrl}${safePath}`;
}
