import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"
import Calendar from "react-calendar"
import { mealService } from "../../services/mealService"
import LoadingSpinner from "../common/LoadingSpinner"

const MealSchedule = ({ 
  selectedDate = new Date().toISOString().split('T')[0], 
  onDateChange = () => {} 
}) => {
  const [showCalendar, setShowCalendar] = useState(false)

  const getDateRange = () => {
    const endDate = new Date(selectedDate)
    const startDate = new Date(selectedDate)
    startDate.setDate(startDate.getDate() - 2)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  const { startDate, endDate } = getDateRange()

  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ["meals", startDate, endDate],
    queryFn: () => mealService.getMeals(startDate, endDate),
    refetchInterval: 5 * 60 * 1000,
  })

  const groupMealsByDate = (meals) => {
    const grouped = {}
    meals.forEach(meal => {
      const date = new Date(meal.date).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(meal)
    })
    return grouped
  }

  const generateDaysData = () => {
    const days = []
    const groupedMeals = groupMealsByDate(meals)
    
    for (let i = 2; i >= 0; i--) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
      const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      
      days.push({
        date: dateStr,
        displayName: dayName,
        displayDate: dayDate,
        meals: groupedMeals[dateStr] || []
      })
    }
    
    return days
  }

  const getMealDisplayText = (meal) => {
    const mealTypeMap = {
      breakfast: "Breakfast",
      lunch: "Lunch", 
      dinner: "Dinner",
      snack: "Snack"
    }
    
    const mealType = mealTypeMap[meal.mealType] || meal.mealType
    const dishName = meal.dishName || "Custom Dish"
    
    return `${mealType}: ${dishName}`
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-red-500">Error loading meal schedule</div>

  const daysData = generateDaysData()

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">

      <div className="flex items-center justify-center mb-4">
        <div 
          className="bg-gray-100 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <span className="text-gray-600 font-medium">
            Today: {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {showCalendar && (
        <div className="mb-4">
          <Calendar
            onChange={(date) => {
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const newDate = `${year}-${month}-${day}`
              onDateChange(newDate)
              setShowCalendar(false)
            }}
            value={new Date(selectedDate)}
            className="react-calendar w-full"
          />
        </div>
      )}


      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {daysData.map((day, index) => (
            <div key={day.date} className="px-4 first:pl-0 last:pr-0">

              <div className="text-center pb-3 border-b border-gray-200 mb-3">
                <div className="text-lg font-bold text-gray-800">{day.displayName}</div>
                <div className="text-sm text-gray-600">{day.displayDate}</div>
              </div>
              

              <div className="space-y-1">
                {day.meals.length > 0 ? (
                  day.meals.map((meal, mealIndex) => (
                    <div key={meal._id} className="text-sm text-gray-700 py-1">
                      {getMealDisplayText(meal)}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400 italic py-1">
                    No meals logged
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MealSchedule;