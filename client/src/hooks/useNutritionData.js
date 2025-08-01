import { useMemo } from "react"

export const useNutritionData = (meals, selectedDate, activeTab) => {
  const nutritionData = useMemo(() => {
    if (!meals || meals.length === 0) return null

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.totalCalories || 0
        acc.protein += meal.totalProtein || 0
        acc.carbs += meal.totalCarbs || 0
        acc.fat += meal.totalFat || 0
        acc.fiber += meal.totalFiber || 0
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, water: 0 }
    )

    const selectedDateStr = selectedDate
    const dayMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date).toISOString().split('T')[0]
      return mealDate === selectedDateStr
    })
    
    let waterIntake = 0
    if (dayMeals.length > 0) {
      dayMeals.forEach(meal => {
        waterIntake += 0.2
        waterIntake += (meal.ingredients.length * 0.05)
      })
    }
    
    totals.water = Math.round(waterIntake * 10) / 10

    const goals = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
      fiber: 25,
      water: 2.2,
    }

    const remaining = {
      calories: goals.calories - totals.calories,
      protein: goals.protein - totals.protein,
      carbs: goals.carbs - totals.carbs,
      fat: goals.fat - totals.fat,
      fiber: goals.fiber - totals.fiber,
      water: goals.water - totals.water,
    }

    return { totals, goals, remaining }
  }, [meals])

  const chartData = useMemo(() => {
    if (!meals || meals.length === 0) return null


    const days = []
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().split('T')[0]
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      days.push(`${dayName} ${dayDate}`)
      
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date).toISOString().split('T')[0]
        return mealDate === dayStr
      })
      
      let dayValue = 0
      if (dayMeals.length > 0) {
        dayMeals.forEach(meal => {
          if (activeTab === "Water") {
            dayValue += 0.2 + (meal.ingredients.length * 0.05)
          } else {
            switch (activeTab) {
              case "Calories":
                dayValue += meal.totalCalories || 0
                break
              case "Protein":
                dayValue += meal.totalProtein || 0
                break
              case "Carbs":
                dayValue += meal.totalCarbs || 0
                break
              default:
                dayValue += meal.totalCalories || 0
            }
          }
        })
      }
      
      if (dayMeals.length > 0) {
        data.push(dayValue)
      } else {
        data.push(null)
      }
    }

    const colors = {
      Water: "#10B981",
      Calories: "#F59E0B", 
      Protein: "#3B82F6",
      Carbs: "#8B5CF6"
    }

    const targets = {
      Water: 2.2,
      Calories: 2000,
      Protein: 50,
      Carbs: 250
    }
    
    const target = targets[activeTab] || 0
    
    const belowTargetData = data.map(value => value === null ? null : Math.min(value, target))
    const aboveTargetData = data.map(value => value === null ? null : Math.max(0, value - target))
    
    return {
      labels: days,
      datasets: [
        {
          label: `Below Target`,
          data: belowTargetData,
          backgroundColor: "#10B981",
          borderColor: "#10B981",
          borderWidth: 1,
        },
        {
          label: `Above Target`,
          data: aboveTargetData,
          backgroundColor: "#F59E0B",
          borderColor: "#F59E0B", 
          borderWidth: 1,
        },
      ],
    }
  }, [meals, selectedDate, activeTab])

  return { nutritionData, chartData }
};