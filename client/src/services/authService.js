import axios from "axios"

const API_BASE_URL = "https://well-vantage-server.onrender.com/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

let isRefreshing = false
let refreshAttempts = 0
const MAX_REFRESH_ATTEMPTS = 3

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh') &&
        refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      
      originalRequest._retry = true
      refreshAttempts++

      if (!isRefreshing) {
        isRefreshing = true
        
        try {
          await api.post("/auth/refresh")
          refreshAttempts = 0
          isRefreshing = false
          return api(originalRequest)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          isRefreshing = false
          
          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            window.location.href = "/auth"
          }
          return Promise.reject(refreshError)
        }
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(api(originalRequest))
          }, 1000)
        })
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
    console.log('Automatic token refresh disabled - using interceptor-based refresh')
  },
};