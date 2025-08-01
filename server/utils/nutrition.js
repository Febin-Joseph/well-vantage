const calculateNutritionTotals = (ingredients) => {
  return ingredients.reduce(
    (totals, ingredient) => {
      const originalQuantity = ingredient.originalQuantity || ingredient.quantity
      const currentQuantity = ingredient.quantity
      const ratio = currentQuantity / originalQuantity
      
      totals.totalCalories += (ingredient.calories || 0) * ratio
      totals.totalProtein += (ingredient.protein || 0) * ratio
      totals.totalCarbs += (ingredient.carbs || 0) * ratio
      totals.totalFat += (ingredient.fat || 0) * ratio
      totals.totalFiber += (ingredient.fiber || 0) * ratio
      return totals
    },
    {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
    },
  )
}

const formatNutritionValue = (value, decimals = 1) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

module.exports = {
  calculateNutritionTotals,
  formatNutritionValue,
}