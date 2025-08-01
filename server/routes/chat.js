const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { analyzeFood } = require("../services/nutritionService")
const { suggestDishes, getDishIngredients } = require("../services/dishSuggestionService")
const router = express.Router()

/**
 * @swagger
 * /chat/analyze-food:
 *   post:
 *     summary: Analyze food item nutrition
 *     description: Uses AI to analyze a food item and provide detailed nutritional information, health benefits, and recommendations
 *     tags: [AI Chat]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - foodItem
 *             properties:
 *               foodItem:
 *                 type: string
 *                 description: Name of the food item to analyze
 *                 example: "apple"
 *           example:
 *             foodItem: "apple"
 *     responses:
 *       200:
 *         description: Food analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FoodAnalysis'
 *             example:
 *               foodItem: "apple"
 *               nutrition:
 *                 calories: 95
 *                 protein: 0.5
 *                 carbs: 25
 *                 fat: 0.3
 *                 fiber: 4.4
 *               healthBenefits:
 *                 - "Rich in fiber"
 *                 - "Contains antioxidants"
 *                 - "Low in calories"
 *                 - "Good source of vitamin C"
 *               recommendations:
 *                 - "Good for weight management"
 *                 - "Excellent source of vitamin C"
 *                 - "Great for digestive health"
 *       400:
 *         description: Food item is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Food item is required"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to analyze food item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to analyze food item"
 */
router.post("/analyze-food", requireAuth, async (req, res) => {
  try {
    const { foodItem } = req.body

    if (!foodItem) {
      return res.status(400).json({ error: "Food item is required" })
    }

    const analysisResult = await analyzeFood(foodItem)
    res.json(analysisResult)
  } catch (error) {
    console.error("Food analysis error:", error.message)
    res.status(500).json({ error: "Failed to analyze food item" })
  }
})

/**
 * @swagger
 * /chat/suggest-dishes:
 *   post:
 *     summary: Get dish suggestions
 *     description: Uses AI to suggest healthy dishes based on user input, preferences, or dietary requirements
 *     tags: [AI Chat]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userInput
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: User's input for dish suggestions (preferences, ingredients, dietary restrictions, etc.)
 *                 example: "I want healthy vegetarian dishes with high protein"
 *           example:
 *             userInput: "I want healthy vegetarian dishes with high protein"
 *     responses:
 *       200:
 *         description: Dish suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishSuggestion'
 *             example:
 *               dishes:
 *                 - name: "Quinoa and Chickpea Buddha Bowl"
 *                   description: "A nutritious vegetarian bowl with quinoa, chickpeas, and roasted vegetables"
 *                   difficulty: "easy"
 *                   prepTime: 25
 *                   nutrition:
 *                     calories: 380
 *                     protein: 18
 *                     carbs: 45
 *                     fat: 12
 *                 - name: "Lentil and Spinach Curry"
 *                   description: "A protein-rich curry made with red lentils and fresh spinach"
 *                   difficulty: "medium"
 *                   prepTime: 35
 *                   nutrition:
 *                     calories: 320
 *                     protein: 22
 *                     carbs: 38
 *                     fat: 8
 *                 - name: "Tofu and Vegetable Stir-Fry"
 *                   description: "A quick and healthy stir-fry with tofu and seasonal vegetables"
 *                   difficulty: "easy"
 *                   prepTime: 20
 *                   nutrition:
 *                     calories: 290
 *                     protein: 20
 *                     carbs: 25
 *                     fat: 15
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/suggest-dishes", requireAuth, async (req, res) => {
  try {
    const { userInput } = req.body
    const result = await suggestDishes(userInput)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /chat/get-dish-ingredients:
 *   post:
 *     summary: Get dish ingredients and instructions
 *     description: Retrieves detailed ingredients list, quantities, nutritional information, and cooking instructions for a specific dish
 *     tags: [AI Chat]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dishName
 *             properties:
 *               dishName:
 *                 type: string
 *                 description: Name of the dish to get ingredients for
 *                 example: "Grilled Salmon with Vegetables"
 *           example:
 *             dishName: "Grilled Salmon with Vegetables"
 *     responses:
 *       200:
 *         description: Dish ingredients and instructions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DishIngredients'
 *             example:
 *               dishName: "Grilled Salmon with Vegetables"
 *               ingredients:
 *                 - name: "Salmon fillet"
 *                   quantity: 200
 *                   unit: "g"
 *                   calories: 280
 *                   protein: 40
 *                   carbs: 0
 *                   fat: 12
 *                   fiber: 0
 *                   originalQuantity: 200
 *                 - name: "Broccoli"
 *                   quantity: 100
 *                   unit: "g"
 *                   calories: 34
 *                   protein: 2.8
 *                   carbs: 7
 *                   fat: 0.4
 *                   fiber: 2.6
 *                   originalQuantity: 100
 *                 - name: "Carrots"
 *                   quantity: 80
 *                   unit: "g"
 *                   calories: 33
 *                   protein: 0.8
 *                   carbs: 8
 *                   fat: 0.2
 *                   fiber: 2.4
 *                   originalQuantity: 80
 *               instructions:
 *                 - "Preheat grill to medium-high heat"
 *                 - "Season salmon with salt and pepper"
 *                 - "Grill salmon for 6-8 minutes per side"
 *                 - "Steam vegetables until tender"
 *                 - "Serve salmon with vegetables"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/get-dish-ingredients", requireAuth, async (req, res) => {
  try {
    const { dishName } = req.body
    const result = await getDishIngredients(dishName)
    
    const ingredientsWithOriginalQuantity = result.ingredients.map(ingredient => ({
      ...ingredient,
      originalQuantity: ingredient.quantity
    }))
    
    res.json({
      ...result,
      ingredients: ingredientsWithOriginalQuantity
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router