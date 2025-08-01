import { useState } from "react"
import { ArrowLeft, Check, Calendar } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import Navigation from "../../components/layout/Navigation"
import { mealService } from "../../services/mealService"

const MealConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { analysisData, selectedDish, originalInput } = location.state || {}

  const [selectedMealType, setSelectedMealType] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const addMealMutation = useMutation({
    mutationFn: mealService.addMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] })
      toast.success("Meal logged successfully!")
      navigate("/fuel")
    },
    onError: () => {
      toast.error("Failed to log meal")
    },
  })

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", emoji: "🌅" },
    { id: "lunch", label: "Lunch", emoji: "☀️" },
    { id: "dinner", label: "Dinner", emoji: "🌙" },
    { id: "snack", label: "Others/Snacks", emoji: "🍎" },
  ]

  const handleConfirm = async () => {
    if (!selectedMealType) {
      toast.error("Please select a meal type")
      return
    }

    addMealMutation.mutate({
      date: selectedDate,
      mealType: selectedMealType,
      dishName: selectedDish,
      ingredients: analysisData.ingredients,
      nutritionValues: analysisData.nutritionValues,
    })
  }

  if (!analysisData || !selectedDish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No meal data available</p>
          <button onClick={() => navigate("/fuel")} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      <div className="bg-white shadow-sm">
        <div className="flex items-center p-4">
          <button onClick={() => navigate("/nutrition-breakdown", { state: { analysisData, selectedDish, originalInput } })}>
            <ArrowLeft className="w-6 h-6 text-gray-600 mr-4" />
          </button>
          <h1 className="text-xl font-semibold">Log Meals</h1>
        </div>
      </div>

      <div className="p-4">

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">When Did This Feast Go Down?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Pick a date and a time slot - breakfast, lunch, dinner, or just a snack - and we'll log it accordingly.
          </p>


          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Date</h3>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 p-2 border-0 bg-transparent focus:outline-none"
              />
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
          </div>


          <div>
            <h3 className="font-medium text-gray-800 mb-3">What type of meal was this?</h3>
            <div className="space-y-3">
              {mealTypes.map((mealType) => (
                <label key={mealType.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="mealType"
                    value={mealType.id}
                    checked={selectedMealType === mealType.id}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                    className="w-4 h-4 text-green-500 border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-gray-800">{mealType.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>


        <button
          onClick={handleConfirm}
          disabled={!selectedMealType || addMealMutation.isLoading}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
            !selectedMealType || addMealMutation.isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {addMealMutation.isLoading ? "Logging..." : "Confirm"}
        </button>
      </div>

      <Navigation />
    </div>
  )
}

export default MealConfirmation;