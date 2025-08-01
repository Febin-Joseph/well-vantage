import { useNavigate, useLocation } from "react-router-dom"
import { Dumbbell, Leaf, Home, TrendingUp, User } from "lucide-react"

const Navigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { id: "gym", icon: Dumbbell, label: "Gym", path: "/gym" },
    { id: "meditation", icon: Leaf, label: "Meditation", path: "/meditation" },
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    { id: "progress", icon: TrendingUp, label: "Progress", path: "/fuel" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ]

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path === "/dashboard" && location.pathname === "/") ||
      (path === "/fuel" && location.pathname.includes("meal"))
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center py-2 px-3 ${active ? "text-green-500" : "text-gray-500"}`}
            >
              <div className={`p-2 rounded-full ${active ? "bg-green-500 text-white" : ""}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation;