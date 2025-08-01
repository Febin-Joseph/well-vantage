import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return user ? children : <Navigate to="/auth" />
}

export default ProtectedRoute;