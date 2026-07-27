import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // hardcoded untuk development
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
