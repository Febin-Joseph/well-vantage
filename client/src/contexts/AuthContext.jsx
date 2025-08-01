import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../services/authService"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    const interval = setInterval(() => {
      checkAuthStatus()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 10000)
      )
      
      const userDataPromise = authService.getCurrentUser()
      const userData = await Promise.race([userDataPromise, timeoutPromise])
      
      setUser(userData)
    } catch (error) {
      console.error('Auth check failed:', error)
      if (error.response?.status === 401) {
        try {
          await authService.refreshToken()
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    loading,
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};