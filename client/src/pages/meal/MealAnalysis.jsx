import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import Navigation from "../../components/layout/Navigation"
import { chatService } from "../../services/chatService"

const MealAnalysis = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { originalInput } = location.state || {}

  const [selectedDish, setSelectedDish] = useState("")
  const [dishSuggestions, setDishSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (originalInput) {
      getDishSuggestions()
    }
  }, [originalInput])

  const getDishSuggestions = async () => {
    setIsLoading(true)
    try {
      const result = await chatService.suggestDishes(originalInput)
      setDishSuggestions(result.suggestions || [])
    } catch (error) {
      toast.error("Failed to get dish suggestions")
      console.error("Dish suggestions error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDishSelect = (dishName) => {
    setSelectedDish(dishName)
  }

  const handleConfirm = async () => {
    if (!selectedDish) {
      toast.error("Please select a dish first")
      return
    }
    
    try {
      const result = await chatService.getDishIngredients(selectedDish)
      navigate("/ingredient-adjustment", {
        state: {
          analysisData: result,
          selectedDish: selectedDish,
          originalInput,
        },
      })
    } catch (error) {
      toast.error("Failed to get dish ingredients")
      console.error("Dish ingredients error:", error)
    }
  }

  const handleBack = () => {
    navigate("/fuel")
  }

  if (!originalInput) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No input data available</p>
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
          <button onClick={handleBack}>
            <ArrowLeft className="w-6 h-6 text-gray-600 mr-4" />
          </button>
          <h1 className="text-xl font-semibold">Dish Analysis</h1>
        </div>
      </div>

      <div className="p-4">

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <div className="text-orange-500 text-sm">⚠️ Snap Judgement</div>
          </div>
          <p className="text-sm text-gray-700 mt-2">
            We think your dish might be one of these — if not, hit "back" and type it in like a boss.
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Dish</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Finding dishes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dishSuggestions.map((dish, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-blue-600 underline cursor-pointer" onClick={() => handleDishSelect(dish)}>
                    {dish}
                  </span>
                  <button
                    onClick={() => handleDishSelect(dish)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedDish === dish ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}


          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500 text-lg">🤔</span>
              <div>
                <p className="font-semibold text-gray-800">Didn't find your dish?</p>
                <p className="text-sm text-gray-600 mt-1">
                  If none of these look right, hit back and try entering the name manually.
                </p>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            disabled={!selectedDish || isLoading}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
              !selectedDish || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            Confirm
          </button>

          <button
            onClick={handleBack}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default MealAnalysis;