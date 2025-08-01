const axios = require("axios")

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models"
const API_TOKEN = process.env.HUGGING_FACE_API_TOKEN || "hf_demo"

const suggestDishes = async (userInput) => {
  try {
    const suggestions = getDishSuggestions(userInput.toLowerCase())
    
    return {
      suggestions,
      originalInput: userInput
    }
  } catch (error) {
    console.error("Dish suggestion error:", error.message)
    return {
      suggestions: getFallbackSuggestions(userInput),
      originalInput: userInput
    }
  }
}

const getDishIngredients = async (dishName) => {
  try {
    const ingredients = getDishIngredientsData(dishName)
    
    return {
      dishName,
      ingredients,
      nutritionalInfo: getNutritionalInfo(dishName)
    }
  } catch (error) {
    console.error("Ingredient fetch error:", error.message)
    return {
      dishName,
      ingredients: getFallbackIngredients(dishName),
      nutritionalInfo: getFallbackNutrition(dishName)
    }
  }
}

const getDishSuggestions = (input) => {
  const dishDatabase = {
    chicken: [
      "Butter Chicken",
      "Chicken Tikka Masala", 
      "Chicken Biryani",
      "Chicken Curry",
      "Chicken Korma",
      "Chicken Manchurian",
      "Chicken Fried Rice",
      "Chicken Noodles"
    ],
    rice: [
      "Chicken Biryani",
      "Vegetable Biryani", 
      "Fried Rice",
      "Pulao",
      "Khichdi",
      "Rice and Curry",
      "Biryani",
      "Pilaf"
    ],
    fish: [
      "Fish Curry",
      "Fish Fry",
      "Fish Biryani",
      "Fish Curry Rice",
      "Grilled Fish",
      "Fish Tacos",
      "Fish and Chips",
      "Fish Stew"
    ],
    egg: [
      "Scrambled Eggs",
      "Omelette",
      "Egg Curry",
      "Egg Fried Rice",
      "Egg Biryani",
      "Egg Sandwich",
      "Egg Noodles",
      "Egg Bhurji"
    ],
    paneer: [
      "Paneer Tikka",
      "Paneer Butter Masala",
      "Paneer Curry",
      "Paneer Biryani",
      "Paneer Fried Rice",
      "Paneer Noodles",
      "Paneer Sandwich",
      "Paneer Bhurji"
    ],
    dal: [
      "Dal Fry",
      "Dal Khichdi",
      "Dal Rice",
      "Dal Curry",
      "Mixed Dal",
      "Dal Tadka",
      "Dal Biryani",
      "Dal Soup"
    ]
  }

  const suggestions = []
  
  for (const [key, dishes] of Object.entries(dishDatabase)) {
    if (input.includes(key)) {
      suggestions.push(...dishes.slice(0, 3))
      break
    }
  }

  if (suggestions.length === 0) {
    return [
      "Chicken Curry",
      "Vegetable Biryani", 
      "Fish Fry",
      "Paneer Tikka",
      "Dal Fry",
      "Egg Curry"
    ].slice(0, 3)
  }

  return suggestions
}

const getDishIngredientsData = (dishName) => {
  const ingredientsDatabase = {
    "Butter Chicken": [
      { name: "Chicken", quantity: 500, unit: "g", calories: 250, protein: 45, carbs: 0, fat: 8, fiber: 0 },
      { name: "Butter", quantity: 50, unit: "g", calories: 360, protein: 0, carbs: 0, fat: 40, fiber: 0 },
      { name: "Tomato", quantity: 200, unit: "g", calories: 36, protein: 2, carbs: 8, fat: 0, fiber: 2 },
      { name: "Cream", quantity: 100, unit: "ml", calories: 340, protein: 2, carbs: 3, fat: 36, fiber: 0 },
      { name: "Spices", quantity: 20, unit: "g", calories: 80, protein: 3, carbs: 15, fat: 2, fiber: 5 }
    ],
    "Chicken Tikka Masala": [
      { name: "Chicken", quantity: 500, unit: "g", calories: 250, protein: 45, carbs: 0, fat: 8, fiber: 0 },
      { name: "Yogurt", quantity: 100, unit: "g", calories: 59, protein: 10, carbs: 3, fat: 0, fiber: 0 },
      { name: "Tomato", quantity: 200, unit: "g", calories: 36, protein: 2, carbs: 8, fat: 0, fiber: 2 },
      { name: "Cream", quantity: 100, unit: "ml", calories: 340, protein: 2, carbs: 3, fat: 36, fiber: 0 },
      { name: "Spices", quantity: 20, unit: "g", calories: 80, protein: 3, carbs: 15, fat: 2, fiber: 5 }
    ],
    "Chicken Biryani": [
      { name: "Chicken", quantity: 500, unit: "g", calories: 250, protein: 45, carbs: 0, fat: 8, fiber: 0 },
      { name: "Rice", quantity: 300, unit: "g", calories: 360, protein: 7, carbs: 80, fat: 1, fiber: 2 },
      { name: "Onion", quantity: 100, unit: "g", calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2 },
      { name: "Spices", quantity: 30, unit: "g", calories: 120, protein: 4, carbs: 22, fat: 3, fiber: 8 },
      { name: "Oil", quantity: 50, unit: "ml", calories: 450, protein: 0, carbs: 0, fat: 50, fiber: 0 }
    ],
    "Fish Curry": [
      { name: "Fish", quantity: 400, unit: "g", calories: 200, protein: 40, carbs: 0, fat: 4, fiber: 0 },
      { name: "Coconut Milk", quantity: 200, unit: "ml", calories: 400, protein: 4, carbs: 6, fat: 40, fiber: 0 },
      { name: "Tomato", quantity: 150, unit: "g", calories: 27, protein: 1, carbs: 6, fat: 0, fiber: 2 },
      { name: "Onion", quantity: 100, unit: "g", calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2 },
      { name: "Spices", quantity: 20, unit: "g", calories: 80, protein: 3, carbs: 15, fat: 2, fiber: 5 }
    ],
    "Paneer Tikka": [
      { name: "Paneer", quantity: 300, unit: "g", calories: 900, protein: 60, carbs: 6, fat: 72, fiber: 0 },
      { name: "Yogurt", quantity: 100, unit: "g", calories: 59, protein: 10, carbs: 3, fat: 0, fiber: 0 },
      { name: "Bell Pepper", quantity: 100, unit: "g", calories: 31, protein: 1, carbs: 7, fat: 0, fiber: 2 },
      { name: "Onion", quantity: 100, unit: "g", calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2 },
      { name: "Spices", quantity: 15, unit: "g", calories: 60, protein: 2, carbs: 11, fat: 2, fiber: 4 }
    ],
    "Dal Fry": [
      { name: "Lentils", quantity: 200, unit: "g", calories: 230, protein: 18, carbs: 40, fat: 1, fiber: 16 },
      { name: "Onion", quantity: 100, unit: "g", calories: 40, protein: 1, carbs: 9, fat: 0, fiber: 2 },
      { name: "Tomato", quantity: 100, unit: "g", calories: 18, protein: 1, carbs: 4, fat: 0, fiber: 1 },
      { name: "Ginger", quantity: 20, unit: "g", calories: 16, protein: 0, carbs: 4, fat: 0, fiber: 1 },
      { name: "Spices", quantity: 15, unit: "g", calories: 60, protein: 2, carbs: 11, fat: 2, fiber: 4 }
    ]
  }

  return ingredientsDatabase[dishName] || getFallbackIngredients(dishName)
}

const getNutritionalInfo = (dishName) => {
  const nutritionDatabase = {
    "Butter Chicken": { calories: 450, protein: 25, carbs: 8, fat: 35, fiber: 3 },
    "Chicken Tikka Masala": { calories: 380, protein: 28, carbs: 12, fat: 25, fiber: 4 },
    "Chicken Biryani": { calories: 520, protein: 30, carbs: 65, fat: 18, fiber: 6 },
    "Fish Curry": { calories: 320, protein: 35, carbs: 15, fat: 18, fiber: 4 },
    "Paneer Tikka": { calories: 420, protein: 45, carbs: 12, fat: 28, fiber: 3 },
    "Dal Fry": { calories: 280, protein: 18, carbs: 45, fat: 8, fiber: 12 }
  }

  return nutritionDatabase[dishName] || getFallbackNutrition(dishName)
}

const getFallbackSuggestions = (input) => {
  return [
    "Chicken Curry",
    "Vegetable Biryani",
    "Fish Fry"
  ]
}

const getFallbackIngredients = (dishName) => {
  return [
    { name: dishName, quantity: 300, unit: "g", calories: 250, protein: 20, carbs: 30, fat: 10, fiber: 5 },
    { name: "Spices", quantity: 20, unit: "g", calories: 80, protein: 3, carbs: 15, fat: 2, fiber: 5 },
    { name: "Oil", quantity: 30, unit: "ml", calories: 270, protein: 0, carbs: 0, fat: 30, fiber: 0 }
  ]
}

const getFallbackNutrition = (dishName) => {
  return { calories: 350, protein: 25, carbs: 35, fat: 15, fiber: 8 }
}

module.exports = { suggestDishes, getDishIngredients }