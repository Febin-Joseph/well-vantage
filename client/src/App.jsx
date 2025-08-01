import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ProtectedRoute from "./components/common/ProtectedRoute"
import AuthPage from "./pages/auth/AuthPage"
import MoodTrends from "./pages/mood/MoodTrends"
import FuelPage from "./pages/fuel/FuelPage"
import MealAnalysis from "./pages/meal/MealAnalysis"
import IngredientAdjustment from "./pages/meal/IngredientAdjustment"
import NutritionBreakdown from "./pages/meal/NutritionBreakdown"
import IngredientDetails from "./pages/meal/IngredientDetails"
import MealConfirmation from "./pages/meal/MealConfirmation"
import NotFound from "./pages/NotFound"
import { authService } from "./services/authService"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

function App() {
  React.useEffect(() => {
    authService.startTokenRefresh()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MoodTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fuel"
                element={
                  <ProtectedRoute>
                    <FuelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-analysis"
                element={
                  <ProtectedRoute>
                    <MealAnalysis />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ingredient-adjustment"
                element={
                  <ProtectedRoute>
                    <IngredientAdjustment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nutrition-breakdown"
                element={
                  <ProtectedRoute>
                    <NutritionBreakdown />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ingredient-details"
                element={
                  <ProtectedRoute>
                    <IngredientDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meal-confirmation"
                element={
                  <ProtectedRoute>
                    <MealConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App;