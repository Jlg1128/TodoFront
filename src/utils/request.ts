import axios, { AxiosRequestConfig } from 'axios';

const isEnvProduction = process.env.NODE_ENV === 'production';

const config: AxiosRequestConfig = {
  // baseURL: 'http://localhost:8083',
  timeout: 5000,
};

const axiosInstance = axios.create(config);
axiosInstance.interceptors.request.use((axiosConfig) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    // 判断是否存在token，如果存在的话，则每个http header都加上token
    // @ts-ignore
    axiosConfig.headers.Authorization = token;
  }
  return axiosConfig;
}, (error) => Promise.reject(error));

export default axiosInstance;
