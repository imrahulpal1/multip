import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach stored token on every request if not already set per-call
httpClient.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const token = localStorage.getItem('lingualearn-token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default httpClient
