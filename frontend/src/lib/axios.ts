import { API_URL } from '@/constants/env'
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN_KEY } from '@/lib/auth'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default api
