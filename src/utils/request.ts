import { message } from 'antd';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const config: AxiosRequestConfig = {
  // baseURL: 'http://localhost:8083',
  timeout: 5000,
};

export enum ResStatusCode {
  SUCCESS = 200,
  ERROR = 400,
  NOAUTH = 401,
  PARAMWRONG = 400,
}

const axiosInstance = axios.create(config);

// axiosInstance.interceptors.request.use((axiosConfig) => {
//   const token = sessionStorage.getItem('token');
//   if (token) {
//     // 判断是否存在token，如果存在的话，则每个http header都加上token
//     axiosConfig.headers.Authorization = token;
//   }
//   return axiosConfig;
// }, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use((response: AxiosResponse) => {
  console.log("response", response);
  if (response.data.id === ResStatusCode.NOAUTH) {
    message.error("未登录，即将跳转到首页");
    window.location.pathname !== '/' && setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  }
  return response;
}, (error) => Promise.reject(error));

export default axiosInstance;
