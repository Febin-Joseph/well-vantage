const LoadingSpinner = ({ size = "default", type = "spinner" }) => {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-16 w-16", 
    large: "h-32 w-32"
  }

  if (type === "skeleton") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header skeleton */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Content skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-green-500 shadow-sm mx-auto mb-4`}></div>
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner;