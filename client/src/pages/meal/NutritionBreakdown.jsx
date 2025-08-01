import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import Navigation from "../../components/layout/Navigation"

const NutritionBreakdown = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { analysisData, selectedDish, originalInput } = location.state || {}

  const [nutritionValues, setNutritionValues] = useState({
    calories: 100,
    protein: 100,
    fats: 100,
    fibre: 100,
    sugar: 100
  })

  useEffect(() => {
    if (analysisData?.ingredients) {
      const calculated = analysisData.ingredients.reduce((acc, ingredient) => {
        const originalQuantity = ingredient.originalQuantity || ingredient.quantity
        const currentQuantity = ingredient.quantity
        const ratio = currentQuantity / originalQuantity
        
        return {
          calories: acc.calories + ((ingredient.calories || 0) * ratio),
          protein: acc.protein + ((ingredient.protein || 0) * ratio),
          fats: acc.fats + ((ingredient.fat || 0) * ratio),
          fibre: acc.fibre + ((ingredient.fiber || 0) * ratio),
          sugar: acc.sugar + ((ingredient.carbs || 0) * ratio * 0.1)
        }
      }, { calories: 0, protein: 0, fats: 0, fibre: 0, sugar: 0 })

      setNutritionValues({
        calories: Math.round(calculated.calories),
        protein: Math.round(calculated.protein * 10) / 10,
        fats: Math.round(calculated.fats * 10) / 10,
        fibre: Math.round(calculated.fibre * 10) / 10,
        sugar: Math.round(calculated.sugar * 10) / 10
      })
    }
  }, [analysisData])

  const handleNutritionChange = (field, value) => {
    setNutritionValues(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleConfirm = () => {
    const updatedIngredients = analysisData.ingredients.map(ingredient => ({
      ...ingredient,
      calories: ingredient.calories || 0,
      protein: ingredient.protein || 0,
      fat: ingredient.fat || 0,
      fiber: ingredient.fiber || 0,
      carbs: ingredient.carbs || 0
    }))

    navigate("/meal-confirmation", {
      state: {
        analysisData: {
          ...analysisData,
          ingredients: updatedIngredients,
          nutritionValues
        },
        selectedDish,
        originalInput,
      },
    })
  }

  const handleBack = () => {
    navigate("/ingredient-adjustment", {
      state: { analysisData, selectedDish, originalInput }
    })
  }

  if (!analysisData || !selectedDish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No nutrition data available</p>
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
          <h1 className="text-xl font-semibold">Nutrition Summary</h1>
        </div>
      </div>

      <div className="p-4">

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Crunch the Numbers</h2>
          <p className="text-sm text-gray-600 mb-6">
            Here's your nutrition breakdown. All looks good? Hit Confirm to log this delicious crime.
          </p>


           <div className="space-y-4">
             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
               <span className="font-medium text-gray-800">Calories</span>
               <div className="flex items-center space-x-2">
                 <span className="w-20 p-2 bg-green-50 rounded text-center text-sm font-medium">
                   {nutritionValues.calories}
                 </span>
                 <span className="text-sm text-gray-500">kcal</span>
               </div>
             </div>

             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
               <span className="font-medium text-gray-800">Protein</span>
               <div className="flex items-center space-x-2">
                 <span className="w-20 p-2 bg-green-50 rounded text-center text-sm font-medium">
                   {nutritionValues.protein}
                 </span>
                 <span className="text-sm text-gray-500">g</span>
               </div>
             </div>

             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
               <span className="font-medium text-gray-800">Fats</span>
               <div className="flex items-center space-x-2">
                 <span className="w-20 p-2 bg-green-50 rounded text-center text-sm font-medium">
                   {nutritionValues.fats}
                 </span>
                 <span className="text-sm text-gray-500">g</span>
               </div>
             </div>

             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
               <span className="font-medium text-gray-800">Fibre</span>
               <div className="flex items-center space-x-2">
                 <span className="w-20 p-2 bg-green-50 rounded text-center text-sm font-medium">
                   {nutritionValues.fibre}
                 </span>
                 <span className="text-sm text-gray-500">g</span>
               </div>
             </div>

             <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
               <span className="font-medium text-gray-800">Sugar</span>
               <div className="flex items-center space-x-2">
                 <span className="w-20 p-2 bg-green-50 rounded text-center text-sm font-medium">
                   {nutritionValues.sugar}
                 </span>
                 <span className="text-sm text-gray-500">g</span>
               </div>
             </div>
           </div>
        </div>


        <button
          onClick={handleConfirm}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Confirm
        </button>
      </div>

      <Navigation />
    </div>
  )
}

export default NutritionBreakdown;