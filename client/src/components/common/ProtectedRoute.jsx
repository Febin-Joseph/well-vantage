import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"
import LoadingSpinner from "./LoadingSpinner"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  console.log('ProtectedRoute - loading:', loading, 'user:', user)

  if (loading) {
    return <LoadingSpinner type="skeleton" />
  }

  if (!user) {
    console.log('ProtectedRoute - redirecting to auth, no user found')
    return <Navigate to="/auth" />
  }

  return children
}

export default ProtectedRoute;