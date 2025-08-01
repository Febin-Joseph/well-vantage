import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import Navigation from "../../components/layout/Navigation"

const IngredientAdjustment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { analysisData, selectedDish, originalInput } = location.state || {}

  const [ingredients, setIngredients] = useState(analysisData?.ingredients || [])
  const [quantities, setQuantities] = useState({})
  const [units, setUnits] = useState({})
  const [editingIngredient, setEditingIngredient] = useState(null)
  const [newIngredientName, setNewIngredientName] = useState("")

  useEffect(() => {
    if (analysisData?.ingredients && analysisData.ingredients.length > 0) {
      const initialQuantities = {}
      const initialUnits = {}
      const updatedIngredients = analysisData.ingredients.map(ingredient => ({
        ...ingredient,
        originalQuantity: ingredient.originalQuantity || ingredient.quantity
      }))
      
      updatedIngredients.forEach(ingredient => {
        initialQuantities[ingredient.name] = ingredient.quantity
        initialUnits[ingredient.name] = ingredient.unit
      })
      
      setIngredients(updatedIngredients)
      setQuantities(initialQuantities)
      setUnits(initialUnits)
    }
  }, [analysisData])

  const handleQuantityChange = (ingredientName, value) => {
    if (value === "" || value === null || value === undefined) {
      setQuantities(prev => ({
        ...prev,
        [ingredientName]: 0
      }))
    } else {
      const numValue = parseFloat(value) || 0
      setQuantities(prev => ({
        ...prev,
        [ingredientName]: numValue
      }))
    }
  }

  const handleUnitChange = (ingredientName, value) => {
    setUnits(prev => ({
      ...prev,
      [ingredientName]: value
    }))
  }

  const handleRenameIngredient = (oldName, newName) => {
    if (!newName.trim()) return
    
    setIngredients(prev => prev.map(ing => 
      ing.name === oldName ? { ...ing, name: newName.trim() } : ing
    ))
    
    setQuantities(prev => {
      const newQuantities = { ...prev }
      if (newQuantities[oldName] !== undefined) {
        newQuantities[newName.trim()] = newQuantities[oldName]
        delete newQuantities[oldName]
      }
      return newQuantities
    })
    
    setUnits(prev => {
      const newUnits = { ...prev }
      if (newUnits[oldName] !== undefined) {
        newUnits[newName.trim()] = newUnits[oldName]
        delete newUnits[oldName]
      }
      return newUnits
    })
    
    setEditingIngredient(null)
    setNewIngredientName("")
  }

  const handleDeleteIngredient = (ingredientName) => {
    setIngredients(prev => prev.filter(ing => ing.name !== ingredientName))
    setQuantities(prev => {
      const newQuantities = { ...prev }
      delete newQuantities[ingredientName]
      return newQuantities
    })
    setUnits(prev => {
      const newUnits = { ...prev }
      delete newUnits[ingredientName]
      return newUnits
    })
  }

  const handleAddIngredient = () => {
    const newIngredient = {
      name: `New Ingredient ${ingredients.length + 1}`,
      quantity: 100,
      unit: "g",
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 5,
      fiber: 2
    }
    setIngredients(prev => [...prev, newIngredient])
    setQuantities(prev => ({
      ...prev,
      [newIngredient.name]: newIngredient.quantity
    }))
    setUnits(prev => ({
      ...prev,
      [newIngredient.name]: newIngredient.unit
    }))
    setEditingIngredient(newIngredient.name)
    setNewIngredientName(newIngredient.name)
  }

  const handleConfirm = () => {
    const updatedIngredients = ingredients.map(ingredient => ({
      ...ingredient,
      quantity: quantities[ingredient.name] || ingredient.quantity,
      unit: units[ingredient.name] || ingredient.unit
    }))

    navigate("/nutrition-breakdown", {
      state: {
        analysisData: {
          ...analysisData,
          ingredients: updatedIngredients
        },
        selectedDish,
        originalInput,
      },
    })
  }

  const handleBack = () => {
    navigate("/meal-analysis", {
      state: { originalInput }
    })
  }

  if (!analysisData || !selectedDish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dish data available</p>
          <button onClick={() => navigate("/fuel")} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

       <div className="bg-white shadow-sm border-b border-gray-200">
         <div className="flex items-center p-4">
           <button onClick={handleBack}>
             <ArrowLeft className="w-6 h-6 text-gray-600 mr-4" />
           </button>
           <h1 className="text-xl font-semibold">Dish</h1>
           <div className="ml-auto">
             <span className="border border-green-500 text-green-600 px-3 py-1 rounded-full text-sm font-medium bg-white">
               {selectedDish}
             </span>
           </div>
         </div>
       </div>

      <div className="p-4">

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Mix It Up</h2>
          <p className="text-sm text-gray-600 mb-4">
            Here's the usual recipe lineup. Tweak anything you like, then hit Confirm to cook things up.
          </p>


           <div className="space-y-3">
             <div className="flex justify-end">
               <h3 className="font-medium text-gray-800">Quantity</h3>
             </div>
             
             {ingredients.map((ingredient, index) => (
               <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                 <div className="flex-1">
                   {editingIngredient === ingredient.name ? (
                     <div className="flex items-center space-x-2">
                       <input
                         type="text"
                         value={newIngredientName}
                         onChange={(e) => setNewIngredientName(e.target.value)}
                         onBlur={() => handleRenameIngredient(ingredient.name, newIngredientName)}
                         onKeyPress={(e) => {
                           if (e.key === 'Enter') {
                             handleRenameIngredient(ingredient.name, newIngredientName)
                           }
                         }}
                         className="flex-1 p-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                         autoFocus
                       />
                       <button
                         onClick={() => handleRenameIngredient(ingredient.name, newIngredientName)}
                         className="text-green-500 hover:text-green-700 text-sm"
                       >
                         ✓
                       </button>
                     </div>
                   ) : (
                     <div className="flex items-center space-x-2">
                       <span className="font-medium text-gray-800">{ingredient.name}</span>
                       <button
                         onClick={() => {
                           setEditingIngredient(ingredient.name)
                           setNewIngredientName(ingredient.name)
                         }}
                         className="text-blue-500 hover:text-blue-700 text-sm"
                       >
                         ✏️
                       </button>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex items-center space-x-3">
                   <input
                     type="number"
                     value={quantities[ingredient.name] || ingredient.quantity}
                     onChange={(e) => handleQuantityChange(ingredient.name, e.target.value)}
                     className="w-20 p-2 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                     min="0"
                     step="any"
                   />
                   <select
                     value={units[ingredient.name] || ingredient.unit}
                     onChange={(e) => handleUnitChange(ingredient.name, e.target.value)}
                     className="w-16 p-2 border border-gray-300 rounded text-center text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                   >
                     <option value="g">g</option>
                     <option value="ml">ml</option>
                     <option value="kg">kg</option>
                     <option value="l">l</option>
                     <option value="tbsp">tbsp</option>
                     <option value="tsp">tsp</option>
                     <option value="cup">cup</option>
                     <option value="piece">piece</option>
                   </select>
                   
                   <button
                     onClick={() => handleDeleteIngredient(ingredient.name)}
                     className="text-red-500 hover:text-red-700 p-1"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             ))}
           </div>


           <div className="flex justify-center mt-4">
             <button
               onClick={handleAddIngredient}
               className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
             >
               <Plus className="w-5 h-5" />
             </button>
           </div>
        </div>

                 
         <button
           onClick={handleConfirm}
           disabled={ingredients.length === 0}
           className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
             ingredients.length === 0 
               ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
               : 'bg-green-500 hover:bg-green-600 text-white'
           }`}
         >
           Confirm
         </button>
      </div>

      <Navigation />
    </div>
  )
}

export default IngredientAdjustment;