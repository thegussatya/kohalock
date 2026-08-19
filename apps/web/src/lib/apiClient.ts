import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Menambahkan interceptor untuk menyisipkan token secara otomatis ke setiap request
apiClient.interceptors.request.use(
  (config) => {
    // Mengecek localStorage (hanya berjalan di browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kohalock_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
