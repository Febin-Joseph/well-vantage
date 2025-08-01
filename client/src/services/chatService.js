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

export const chatService = {
  analyzeFood: async (foodItem) => {
    const response = await api.post("/chat/analyze-food", { foodItem })
    return response.data
  },
  
  suggestDishes: async (userInput) => {
    const response = await api.post("/chat/suggest-dishes", { userInput })
    return response.data
  },
  
  getDishIngredients: async (dishName) => {
    const response = await api.post("/chat/get-dish-ingredients", { dishName })
    return response.data
  },
};