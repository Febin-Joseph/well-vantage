const axios = require("axios")

const analyzeFood = async (foodItem) => {
  try {
    const searchResponse = await axios.get(
      `https://trackapi.nutritionix.com/v2/search/instant`,
      {
        params: {
          query: foodItem,
          branded: false,
          common: true,
        },
        headers: {
          "x-app-id": "YOUR_NUTRITIONIX_APP_ID",
          "x-app-key": "YOUR_NUTRITIONIX_APP_KEY",
          "x-remote-user-id": "0",
        },
      },
    )

    if (!searchResponse.data.common || searchResponse.data.common.length === 0) {
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
        note: "Nutritional data not found, showing estimated values",
      }
    }

    const foodData = searchResponse.data.common[0]
    
    const nutritionResponse = await axios.post(
      "https://trackapi.nutritionix.com/v2/natural/nutrients",
      {
        query: foodItem,
        timezone: "US/Eastern",
      },
      {
        headers: {
          "x-app-id": "YOUR_NUTRITIONIX_APP_ID",
          "x-app-key": "YOUR_NUTRITIONIX_APP_KEY",
          "x-remote-user-id": "0",
          "Content-Type": "application/json",
        },
      },
    )

    if (!nutritionResponse.data.foods || nutritionResponse.data.foods.length === 0) {
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
        note: "Nutritional data not found, showing estimated values",
      }
    }

    const nutrition = nutritionResponse.data.foods[0]
    
    return {
      dishName: nutrition.food_name,
      ingredients: [
        {
          name: nutrition.food_name,
          quantity: nutrition.serving_qty || 100,
          unit: nutrition.serving_unit || "g",
          calories: Math.round(nutrition.nf_calories || 200),
          protein: Math.round((nutrition.nf_protein || 5) * 10) / 10,
          carbs: Math.round((nutrition.nf_total_carbohydrate || 30) * 10) / 10,
          fat: Math.round((nutrition.nf_total_fat || 8) * 10) / 10,
          fiber: Math.round((nutrition.nf_dietary_fiber || 3) * 10) / 10,
        },
      ],
    }
  } catch (error) {
    console.error("Nutrition API error:", error.message)
  
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
      note: "API error, showing estimated values",
    }
  }
}

module.exports = { analyzeFood }