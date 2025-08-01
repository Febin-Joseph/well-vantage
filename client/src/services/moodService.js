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
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = "/auth"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const moodService = {
  getMoodEntries: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get("/mood", { params })
    return response.data
  },

  addMoodEntry: async (moodData) => {
    const response = await api.post("/mood", moodData)
    return response.data
  },

  updateMoodEntry: async (id, moodData) => {
    const response = await api.put(`/mood/${id}`, moodData)
    return response.data
  },

  deleteMoodEntry: async (id) => {
    const response = await api.delete(`/mood/${id}`)
    return response.data
  },
};