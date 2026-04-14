import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default httpClient
