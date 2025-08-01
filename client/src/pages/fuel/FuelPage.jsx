import { useState } from "react"
import { ArrowLeft, Info, Mic, Camera, Send, ChevronDown } from "lucide-react"
import Calendar from "react-calendar"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import annotationPlugin from "chartjs-plugin-annotation"
import { useQuery, useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import Navigation from "../../components/layout/Navigation"
import { mealService } from "../../services/mealService"
import { chatService } from "../../services/chatService"
import { useNutritionData } from "../../hooks/useNutritionData"
import MealSchedule from "../../components/meal/MealSchedule"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, annotationPlugin)

const FuelPage = () => {
  const navigate = useNavigate()
  const [chatInput, setChatInput] = useState("")
  const getCurrentDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDate())
  const [showNutritionCalendar, setShowNutritionCalendar] = useState(false)
  const [showChartCalendar, setShowChartCalendar] = useState(false)
  const [activeTab, setActiveTab] = useState("Water")

  const weekStart = new Date(selectedDate)
  weekStart.setDate(weekStart.getDate() - 6)
  const weekEnd = new Date(selectedDate)
  
  const { data: meals = [] } = useQuery({
    queryKey: ["meals", weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]],
    queryFn: () => mealService.getMeals(weekStart.toISOString().split("T")[0], weekEnd.toISOString().split("T")[0]),
    refetchInterval: 30000,
  })

  const analyzeFoodMutation = useMutation({
    mutationFn: chatService.analyzeFood,
    onSuccess: (data) => {
      navigate("/meal-analysis", {
        state: {
          originalInput: chatInput,
        },
      })
    },
    onError: () => {
      toast.error("Failed to analyze food item")
    },
  })

  const { nutritionData, chartData } = useNutritionData(meals, selectedDate, activeTab)

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return
    analyzeFoodMutation.mutate(chatInput)
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      annotation: {
        annotations: {
          targetLine: {
            type: 'line',
            yMin: activeTab === "Water" ? 2.2 : activeTab === "Calories" ? 2000 : activeTab === "Protein" ? 50 : 250,
            yMax: activeTab === "Water" ? 2.2 : activeTab === "Calories" ? 2000 : activeTab === "Protein" ? 50 : 250,
            borderColor: '#9CA3AF',
            borderWidth: 1,
            borderDash: [5, 5],
            mode: 'horizontal',
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        stacked: true,
      },
              y: {
          beginAtZero: true,
          max: activeTab === "Water" ? 3 : activeTab === "Calories" ? 3000 : activeTab === "Protein" ? 100 : 300,
          stacked: true,
        ticks: {
          callback: (value) => {
            if (activeTab === "Water") return value.toFixed(1) + " L"
            if (activeTab === "Calories") return value + " kcal"
            return value + " g"
          },
        },
        grid: {
          color: "#f3f4f6",
        },
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-hidden">
      <div className="bg-white shadow-sm">
        <div className="flex flex-col p-4">
          <ArrowLeft className="w-6 h-6 text-gray-600 mb-4" />
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
            <span className="text-gray-500 whitespace-nowrap">Body</span>
            <span className="text-gray-500 whitespace-nowrap">Mind+ Rest</span>
            <span className="text-green-500 font-medium border-b-2 border-green-500 pb-1 whitespace-nowrap">Fuel</span>
            <span className="text-gray-500 whitespace-nowrap">Meds</span>
            <span className="text-gray-500 whitespace-nowrap">Alerts</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Hydration and Diet</h1>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat GPT</h2>
            <Info className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-600 mb-4 text-center">What can I help with?</p>

          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chat GPT"
              disabled={analyzeFoodMutation.isLoading}
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              onKeyPress={(e) => e.key === "Enter" && handleChatSubmit()}
            />
            <button
              onClick={handleChatSubmit}
              disabled={analyzeFoodMutation.isLoading || !chatInput.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzeFoodMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Track Water Intake
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Nutrition Trends</h2>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-center mb-4">
              <div 
                className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setShowNutritionCalendar(!showNutritionCalendar)}
              >
                <span className="text-gray-600 font-medium">
                  Today: {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {showNutritionCalendar && (
              <div className="mb-4">
                <Calendar
                  onChange={(date) => {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setSelectedDate(`${year}-${month}-${day}`)
                    setShowNutritionCalendar(false)
                  }}
                  value={new Date(selectedDate)}
                  className="react-calendar w-full"
                />
              </div>
            )}

            {nutritionData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-500">Fuel</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Goal</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Consumed</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Left</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-sm text-gray-600">Hydration (L)</div>
                  <div className="text-green-600 font-medium">{nutritionData.goals.water}</div>
                  <div className="text-blue-600 font-medium">{nutritionData.totals.water}</div>
                  <div className="text-orange-600 font-medium">{Math.max(0, nutritionData.remaining.water).toFixed(1)}</div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-sm text-gray-600">Calories (kcal)</div>
                  <div className="text-green-600 font-medium">{nutritionData.goals.calories}</div>
                  <div className="text-blue-600 font-medium">{Math.round(nutritionData.totals.calories)}</div>
                  <div className="text-orange-600 font-medium">{Math.round(nutritionData.remaining.calories)}</div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="text-sm text-gray-600">Protein (g)</div>
                  <div className="text-green-600 font-medium">{nutritionData.goals.protein}</div>
                  <div className="text-blue-600 font-medium">{Math.round(nutritionData.totals.protein)}</div>
                  <div className="text-orange-600 font-medium">{Math.round(nutritionData.remaining.protein)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("Water")}
                className={`whitespace-nowrap font-medium transition-colors ${
                  activeTab === "Water" ? "text-gray-900 border-b-2 border-green-500 pb-1" : "text-gray-500"
                }`}
              >
                Water
              </button>
              <button
                onClick={() => setActiveTab("Calories")}
                className={`whitespace-nowrap font-medium transition-colors ${
                  activeTab === "Calories" ? "text-gray-900 border-b-2 border-green-500 pb-1" : "text-gray-500"
                }`}
              >
                Calories
              </button>
              <button
                onClick={() => setActiveTab("Protein")}
                className={`whitespace-nowrap font-medium transition-colors ${
                  activeTab === "Protein" ? "text-gray-900 border-b-2 border-green-500 pb-1" : "text-gray-500"
                }`}
              >
                Protein
              </button>
              <button
                onClick={() => setActiveTab("Carbs")}
                className={`whitespace-nowrap font-medium transition-colors ${
                  activeTab === "Carbs" ? "text-gray-900 border-b-2 border-green-500 pb-1" : "text-gray-500"
                }`}
              >
                Carbs
              </button>
            </div>
          </div>

                      <div className="flex items-center justify-center mb-4">
              <div 
                className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => setShowChartCalendar(!showChartCalendar)}
              >
                <span className="text-gray-600 font-medium">
                  Today: {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {showChartCalendar && (
              <div className="mb-4">
                <Calendar
                  onChange={(date) => {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setSelectedDate(`${year}-${month}-${day}`)
                    setShowChartCalendar(false)
                  }}
                  value={new Date(selectedDate)}
                  className="react-calendar w-full"
                />
              </div>
            )}

          {chartData ? (
            <div className="h-48">
              <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-500 text-center">No data available</p>
            </div>
          )}
        </div>

        <MealSchedule 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />
      </div>

      <Navigation />
    </div>
  )
}

export default FuelPage;