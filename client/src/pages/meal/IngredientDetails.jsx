import { useState } from "react"
import { ArrowLeft, Plus, Minus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import Navigation from "../../components/layout/Navigation"

const IngredientDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { analysisData, selectedDish, quantities, originalInput } = location.state || {}

  const [ingredients, setIngredients] = useState(
    analysisData?.ingredients.map((ingredient) => ({
      ...ingredient,
      quantity: quantities?.[ingredient.name] || ingredient.quantity,
    })) || [],
  )

  const handleQuantityChange = (index, newQuantity) => {
    const updatedIngredients = [...ingredients]
    const ratio = newQuantity / updatedIngredients[index].quantity

    updatedIngredients[index] = {
      ...updatedIngredients[index],
      quantity: newQuantity,
      calories: Math.round(updatedIngredients[index].calories * ratio),
      protein: Math.round(updatedIngredients[index].protein * ratio * 10) / 10,
      carbs: Math.round(updatedIngredients[index].carbs * ratio * 10) / 10,
      fat: Math.round(updatedIngredients[index].fat * ratio * 10) / 10,
      fiber: Math.round(updatedIngredients[index].fiber * ratio * 10) / 10,
    }

    setIngredients(updatedIngredients)
  }

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(updatedIngredients)
  }

  const handleAddIngredient = () => {
    const newIngredient = {
      name: "New Ingredient",
      quantity: 10,
      unit: "g",
      calories: 50,
      protein: 2,
      carbs: 8,
      fat: 1,
      fiber: 1,
    }
    setIngredients([...ingredients, newIngredient])
  }

  const handleConfirm = () => {
    navigate("/meal-confirmation", {
      state: {
        dishName: selectedDish,
        ingredients,
        originalInput,
      },
    })
  }

  const calculateTotals = () => {
    return ingredients.reduce(
      (totals, ingredient) => {
        totals.calories += ingredient.calories || 0
        totals.protein += ingredient.protein || 0
        totals.carbs += ingredient.carbs || 0
        totals.fat += ingredient.fat || 0
        totals.fiber += ingredient.fiber || 0
        return totals
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )
  }

  const totals = calculateTotals()

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No ingredient data available</p>
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
          <button onClick={() => navigate("/meal-analysis", { state: location.state })}>
            <ArrowLeft className="w-6 h-6 text-gray-600 mr-4" />
          </button>
          <h1 className="text-xl font-semibold">Ingredient Details</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-lg font-semibold">{selectedDish}</h2>
          <p className="text-sm text-gray-500">Adjust ingredients and quantities</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-3">Nutrition Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Calories:</span>
              <span className="font-medium ml-2">{Math.round(totals.calories)} kcal</span>
            </div>
            <div>
              <span className="text-gray-600">Protein:</span>
              <span className="font-medium ml-2">{Math.round(totals.protein * 10) / 10} g</span>
            </div>
            <div>
              <span className="text-gray-600">Carbs:</span>
              <span className="font-medium ml-2">{Math.round(totals.carbs * 10) / 10} g</span>
            </div>
            <div>
              <span className="text-gray-600">Fat:</span>
              <span className="font-medium ml-2">{Math.round(totals.fat * 10) / 10} g</span>
            </div>
            <div>
              <span className="text-gray-600">Fiber:</span>
              <span className="font-medium ml-2">{Math.round(totals.fiber * 10) / 10} g</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Ingredients</h3>
            <button
              onClick={handleAddIngredient}
              className="flex items-center space-x-1 text-green-500 hover:text-green-600"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add</span>
            </button>
          </div>

          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => {
                      const updated = [...ingredients]
                      updated[index].name = e.target.value
                      setIngredients(updated)
                    }}
                    className="font-medium bg-transparent border-none outline-none"
                  />
                  <button onClick={() => handleRemoveIngredient(index)} className="text-red-500 hover:text-red-700">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Quantity:</span>
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => handleQuantityChange(index, Number.parseFloat(e.target.value) || 0)}
                      className="w-16 p-1 border border-gray-300 rounded text-center"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-gray-500">{ingredient.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium ml-2">{ingredient.calories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium ml-2">{ingredient.protein}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-medium ml-2">{ingredient.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-medium ml-2">{ingredient.fat}g</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fiber:</span>
                    <span className="font-medium ml-2">{ingredient.fiber}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}

export default IngredientDetails;