import axios from "axios"

const API_BASE_URL = "https://well-vantage-server.onrender.com/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await api.post("/auth/refresh")
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        window.location.href = "/auth"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

api.interceptors.request.use(
  async (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const authService = {
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/auth/google`
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/user")
    return response.data
  },

  logout: async () => {
    const response = await api.post("/auth/logout")
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh")
    return response.data
  },

  startTokenRefresh: () => {
    setInterval(async () => {
      try {
        await api.post("/auth/refresh")
        console.log('Token refreshed successfully')
      } catch (error) {
        console.error('Background token refresh failed:', error)
      }
    }, 60 * 60 * 1000)
  },
};