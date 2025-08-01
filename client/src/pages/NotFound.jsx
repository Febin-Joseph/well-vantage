import { useNavigate } from "react-router-dom"
import { Home } from "lucide-react"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>Go Home</span>
        </button>
      </div>
    </div>
  )
}

export default NotFound;