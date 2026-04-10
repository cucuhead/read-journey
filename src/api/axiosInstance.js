import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://readjourney.b.goit.study/api',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Login ve register isteklerinde retry yapma
    if (
      originalRequest.url.includes('/users/signin') ||
      originalRequest.url.includes('/users/signup')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.get(
          'https://readjourney.b.goit.study/api/users/current/refresh',
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );

        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return axiosInstance(originalRequest);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;