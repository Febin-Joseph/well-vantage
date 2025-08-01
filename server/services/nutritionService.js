const nutritionDatabase = {
  "apple": {
    name: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    fiber: 2.4,
    serving: "1 medium (182g)"
  },
  "banana": {
    name: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    fiber: 2.6,
    serving: "1 medium (118g)"
  },
  "chicken breast": {
    name: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    serving: "1 breast (174g)"
  },
  "rice": {
    name: "White Rice",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    fiber: 0.4,
    serving: "1 cup cooked (158g)"
  },
  "broccoli": {
    name: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    fiber: 2.6,
    serving: "1 cup chopped (91g)"
  },
  "salmon": {
    name: "Salmon",
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    fiber: 0,
    serving: "1 fillet (154g)"
  },
  "eggs": {
    name: "Eggs",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    fiber: 0,
    serving: "2 large eggs (100g)"
  },
  "milk": {
    name: "Milk",
    calories: 42,
    protein: 3.4,
    carbs: 5,
    fat: 1,
    fiber: 0,
    serving: "1 cup (244g)"
  },
  "bread": {
    name: "Whole Wheat Bread",
    calories: 69,
    protein: 3.6,
    carbs: 12,
    fat: 1.1,
    fiber: 1.9,
    serving: "1 slice (28g)"
  },
  "pasta": {
    name: "Pasta",
    calories: 131,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    fiber: 1.8,
    serving: "1 cup cooked (140g)"
  },
  "tomato": {
    name: "Tomato",
    calories: 22,
    protein: 1.1,
    carbs: 4.8,
    fat: 0.2,
    fiber: 1.2,
    serving: "1 medium (123g)"
  },
  "carrot": {
    name: "Carrot",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    fiber: 2.8,
    serving: "1 cup chopped (128g)"
  },
  "potato": {
    name: "Potato",
    calories: 77,
    protein: 2,
    carbs: 17,
    fat: 0.1,
    fiber: 2.2,
    serving: "1 medium (173g)"
  },
  "spinach": {
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    fiber: 2.2,
    serving: "1 cup (30g)"
  },
  "yogurt": {
    name: "Greek Yogurt",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    serving: "1/2 cup (125g)"
  },
  "cheese": {
    name: "Cheddar Cheese",
    calories: 113,
    protein: 7,
    carbs: 0.4,
    fat: 9,
    fiber: 0,
    serving: "1 oz (28g)"
  },
  "beef": {
    name: "Ground Beef",
    calories: 250,
    protein: 26,
    carbs: 0,
    fat: 15,
    fiber: 0,
    serving: "3 oz cooked (85g)"
  },
  "fish": {
    name: "Cod Fish",
    calories: 105,
    protein: 23,
    carbs: 0,
    fat: 0.9,
    fiber: 0,
    serving: "3 oz cooked (85g)"
  },
  "beans": {
    name: "Black Beans",
    calories: 114,
    protein: 8,
    carbs: 20,
    fat: 0.5,
    fiber: 7.5,
    serving: "1/2 cup cooked (86g)"
  },
  "nuts": {
    name: "Almonds",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    serving: "1 oz (28g)"
  }
}

const analyzeFood = async (foodItem) => {
  try {
    const searchTerm = foodItem.toLowerCase().trim()
    
    let foodData = nutritionDatabase[searchTerm]
    
    if (!foodData) {
      const matchingFoods = Object.keys(nutritionDatabase).filter(key => 
        key.includes(searchTerm) || searchTerm.includes(key)
      )
      
      if (matchingFoods.length > 0) {
        foodData = nutritionDatabase[matchingFoods[0]]
      }
    }
    
    if (foodData) {
      return {
        dishName: foodData.name,
        ingredients: [
          {
            name: foodData.name,
            quantity: 100,
            unit: "g",
            calories: Math.round(foodData.calories),
            protein: Math.round(foodData.protein * 10) / 10,
            carbs: Math.round(foodData.carbs * 10) / 10,
            fat: Math.round(foodData.fat * 10) / 10,
            fiber: Math.round(foodData.fiber * 10) / 10,
          },
        ],
        serving: foodData.serving,
      }
    } else {
      return {
        dishName: foodItem,
        ingredients: [
          {
            name: foodItem,
            quantity: 100,
            unit: "g",
            calories: 200,
            protein: 5,
            carbs: 30,
            fat: 8,
            fiber: 3,
          },
        ],
        note: "Food not found in database, showing estimated values",
      }
    }
  } catch (error) {
    console.error("Nutrition analysis error:", error.message)
    return {
      dishName: foodItem,
      ingredients: [
        {
          name: foodItem,
          quantity: 100,
          unit: "g",
          calories: 200,
          protein: 5,
          carbs: 30,
          fat: 8,
          fiber: 3,
        },
      ],
      note: "Analysis error, showing estimated values",
    }
  }
}

module.exports = { analyzeFood }