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

export const mealService = {
  getMeals: async (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    const response = await api.get("/meals", { params })
    return response.data
  },

  addMeal: async (mealData) => {
    const response = await api.post("/meals", mealData)
    return response.data
  },

  updateMeal: async (id, mealData) => {
    const response = await api.put(`/meals/${id}`, mealData)
    return response.data
  },

  deleteMeal: async (id) => {
    const response = await api.delete(`/meals/${id}`)
    return response.data
  },
};