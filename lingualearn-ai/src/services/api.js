import httpClient from '../utils/httpClient'

export const setAuthToken = (token) => {
  if (token) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete httpClient.defaults.headers.common.Authorization
  }
}

export const authApi = {
  signup: async (payload) => {
    const { data } = await httpClient.post('/auth/signup', payload)
    return data
  },
  login: async (payload) => {
    const { data } = await httpClient.post('/auth/login', payload)
    return data
  },
  me: async () => {
    const { data } = await httpClient.get('/auth/me')
    return data
  },
  updatePreferences: async (payload) => {
    const { data } = await httpClient.patch('/auth/preferences', payload)
    return data
  },
}

export const courseApi = {
  list: async () => {
    const { data } = await httpClient.get('/courses')
    return data
  },
  create: async (payload) => {
    const { data } = await httpClient.post('/courses', payload)
    return data
  },
  update: async (id, payload) => {
    const { data } = await httpClient.put(`/courses/${id}`, payload)
    return data
  },
  remove: async (id) => {
    const { data } = await httpClient.delete(`/courses/${id}`)
    return data
  },
}

export const aiApi = {
  chat: async (payload) => (await httpClient.post('/ai/chat', payload)).data,
  summarize: async (payload) => (await httpClient.post('/ai/summarize', payload)).data,
  explain: async (payload) => (await httpClient.post('/ai/explain', payload)).data,
}

export const forumApi = {
  list: async (language) => (await httpClient.get(`/discussions?language=${encodeURIComponent(language)}`)).data,
  create: async (payload) => (await httpClient.post('/discussions', payload)).data,
  reply: async (id, payload) => (await httpClient.post(`/discussions/${id}/reply`, payload)).data,
  upvote: async (id) => (await httpClient.post(`/discussions/${id}/upvote`)).data,
  approve: async (id) => (await httpClient.patch(`/discussions/${id}/approve`)).data,
}

export const adminApi = {
  users: async () => (await httpClient.get('/admin/users')).data,
  analytics: async () => (await httpClient.get('/admin/analytics')).data,
}

export const gameApi = {
  leaderboard: async () => (await httpClient.get('/leaderboard')).data,
}
