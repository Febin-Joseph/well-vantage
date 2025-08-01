const express = require("express")
const Meal = require("../models/Meal")
const { requireAuth } = require("../middleware/auth")
const { validateMeal } = require("../middleware/validation")
const { calculateNutritionTotals } = require("../utils/nutrition")
const router = express.Router()

/**
 * @swagger
 * /meals:
 *   get:
 *     summary: Get meal entries
 *     description: Retrieves meal tracking entries for the authenticated user, optionally filtered by date range
 *     tags: [Meal Management]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/startDate'
 *       - $ref: '#/components/parameters/endDate'
 *     responses:
 *       200:
 *         description: Meal entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meal'
 *             example:
 *               - _id: "507f1f77bcf86cd799439013"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 date: "2024-01-15T12:00:00.000Z"
 *                 mealType: "lunch"
 *                 dishName: "Grilled Chicken Salad"
 *                 ingredients:
 *                   - name: "Chicken breast"
 *                     quantity: 150
 *                     unit: "g"
 *                     calories: 165
 *                     protein: 31
 *                     carbs: 0
 *                     fat: 3.6
 *                     fiber: 0
 *                   - name: "Mixed greens"
 *                     quantity: 50
 *                     unit: "g"
 *                     calories: 15
 *                     protein: 2
 *                     carbs: 3
 *                     fat: 0.2
 *                     fiber: 2
 *                 totalCalories: 180
 *                 totalProtein: 33
 *                 totalCarbs: 3
 *                 totalFat: 3.8
 *                 totalFiber: 2
 *                 createdAt: "2024-01-15T12:00:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
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
router.get("/", requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const query = { userId: req.user._id }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const meals = await Meal.find(query).sort({ date: -1 })
    res.json(meals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /meals:
 *   post:
 *     summary: Create meal entry
 *     description: Creates a new meal entry with nutritional information. Nutrition values can be provided directly or calculated from ingredients.
 *     tags: [Meal Management]
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
 *               - date
 *               - mealType
 *               - dishName
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the meal
 *                 example: "2024-01-15T12:00:00.000Z"
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *                 description: Type of meal
 *                 example: "lunch"
 *               dishName:
 *                 type: string
 *                 description: Name of the dish
 *                 example: "Grilled Chicken Salad"
 *               ingredients:
 *                 type: array
 *                 description: List of ingredients (optional if nutritionValues provided)
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Ingredient name
 *                       example: "Chicken breast"
 *                     quantity:
 *                       type: number
 *                       description: Quantity of ingredient
 *                       example: 150
 *                     unit:
 *                       type: string
 *                       description: Unit of measurement
 *                       example: "g"
 *                     calories:
 *                       type: number
 *                       description: Calories per unit
 *                       example: 165
 *                     protein:
 *                       type: number
 *                       description: Protein content in grams
 *                       example: 31
 *                     carbs:
 *                       type: number
 *                       description: Carbohydrate content in grams
 *                       example: 0
 *                     fat:
 *                       type: number
 *                       description: Fat content in grams
 *                       example: 3.6
 *                     fiber:
 *                       type: number
 *                       description: Fiber content in grams
 *                       example: 0
 *               nutritionValues:
 *                 type: object
 *                 description: Pre-calculated nutrition values (optional if ingredients provided)
 *                 properties:
 *                   calories:
 *                     type: number
 *                     description: Total calories
 *                     example: 450
 *                   protein:
 *                     type: number
 *                     description: Total protein in grams
 *                     example: 35
 *                   sugar:
 *                     type: number
 *                     description: Sugar content (used to calculate carbs)
 *                     example: 2.5
 *                   fats:
 *                     type: number
 *                     description: Total fat in grams
 *                     example: 12
 *                   fibre:
 *                     type: number
 *                     description: Total fiber in grams
 *                     example: 8
 *           example:
 *             date: "2024-01-15T12:00:00.000Z"
 *             mealType: "lunch"
 *             dishName: "Grilled Chicken Salad"
 *             ingredients:
 *               - name: "Chicken breast"
 *                 quantity: 150
 *                 unit: "g"
 *                 calories: 165
 *                 protein: 31
 *                 carbs: 0
 *                 fat: 3.6
 *                 fiber: 0
 *               - name: "Mixed greens"
 *                 quantity: 50
 *                 unit: "g"
 *                 calories: 15
 *                 protein: 2
 *                 carbs: 3
 *                 fat: 0.2
 *                 fiber: 2
 *     responses:
 *       201:
 *         description: Meal entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meal'
 *             example:
 *               _id: "507f1f77bcf86cd799439013"
 *               userId: "507f1f77bcf86cd799439011"
 *               date: "2024-01-15T12:00:00.000Z"
 *               mealType: "lunch"
 *               dishName: "Grilled Chicken Salad"
 *               ingredients:
 *                 - name: "Chicken breast"
 *                   quantity: 150
 *                   unit: "g"
 *                   calories: 165
 *                   protein: 31
 *                   carbs: 0
 *                   fat: 3.6
 *                   fiber: 0
 *                 - name: "Mixed greens"
 *                   quantity: 50
 *                   unit: "g"
 *                   calories: 15
 *                   protein: 2
 *                   carbs: 3
 *                   fat: 0.2
 *                   fiber: 2
 *               totalCalories: 180
 *               totalProtein: 33
 *               totalCarbs: 3
 *               totalFat: 3.8
 *               totalFiber: 2
 *               createdAt: "2024-01-15T12:00:00.000Z"
 *               updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
router.post("/", requireAuth, validateMeal, async (req, res) => {
  try {
    const { date, mealType, dishName, ingredients, nutritionValues } = req.body

    let totals
    if (nutritionValues) {
      totals = {
        totalCalories: nutritionValues.calories || 0,
        totalProtein: nutritionValues.protein || 0,
        totalCarbs: nutritionValues.sugar * 10 || 0,
        totalFat: nutritionValues.fats || 0,
        totalFiber: nutritionValues.fibre || 0,
      }
    } else {
      totals = calculateNutritionTotals(ingredients)
    }

    const meal = new Meal({
      userId: req.user._id,
      date: new Date(date),
      mealType,
      dishName,
      ingredients,
      ...totals,
    })

    await meal.save()
    res.status(201).json(meal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /meals/{id}:
 *   put:
 *     summary: Update meal entry
 *     description: Updates an existing meal entry by ID. Nutrition totals are automatically recalculated based on the updated ingredients.
 *     tags: [Meal Management]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/mealId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredients
 *             properties:
 *               ingredients:
 *                 type: array
 *                 description: Updated list of ingredients
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Ingredient name
 *                       example: "Chicken breast"
 *                     quantity:
 *                       type: number
 *                       description: Quantity of ingredient
 *                       example: 200
 *                     unit:
 *                       type: string
 *                       description: Unit of measurement
 *                       example: "g"
 *                     calories:
 *                       type: number
 *                       description: Calories per unit
 *                       example: 165
 *                     protein:
 *                       type: number
 *                       description: Protein content in grams
 *                       example: 31
 *                     carbs:
 *                       type: number
 *                       description: Carbohydrate content in grams
 *                       example: 0
 *                     fat:
 *                       type: number
 *                       description: Fat content in grams
 *                       example: 3.6
 *                     fiber:
 *                       type: number
 *                       description: Fiber content in grams
 *                       example: 0
 *           example:
 *             ingredients:
 *               - name: "Chicken breast"
 *                 quantity: 200
 *                 unit: "g"
 *                 calories: 165
 *                 protein: 31
 *                 carbs: 0
 *                 fat: 3.6
 *                 fiber: 0
 *               - name: "Mixed greens"
 *                 quantity: 75
 *                 unit: "g"
 *                 calories: 15
 *                 protein: 2
 *                 carbs: 3
 *                 fat: 0.2
 *                 fiber: 2
 *     responses:
 *       200:
 *         description: Meal entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meal'
 *             example:
 *               _id: "507f1f77bcf86cd799439013"
 *               userId: "507f1f77bcf86cd799439011"
 *               date: "2024-01-15T12:00:00.000Z"
 *               mealType: "lunch"
 *               dishName: "Grilled Chicken Salad"
 *               ingredients:
 *                 - name: "Chicken breast"
 *                   quantity: 200
 *                   unit: "g"
 *                   calories: 165
 *                   protein: 31
 *                   carbs: 0
 *                   fat: 3.6
 *                   fiber: 0
 *                 - name: "Mixed greens"
 *                   quantity: 75
 *                   unit: "g"
 *                   calories: 15
 *                   protein: 2
 *                   carbs: 3
 *                   fat: 0.2
 *                   fiber: 2
 *               totalCalories: 240
 *               totalProtein: 44
 *               totalCarbs: 4.5
 *               totalFat: 5.2
 *               totalFiber: 3
 *               createdAt: "2024-01-15T12:00:00.000Z"
 *               updatedAt: "2024-01-15T13:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Meal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Meal not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { ingredients } = req.body
    const totals = calculateNutritionTotals(ingredients)

    const meal = await Meal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ingredients, ...totals },
      { new: true },
    )

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" })
    }

    res.json(meal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /meals/{id}:
 *   delete:
 *     summary: Delete meal entry
 *     description: Deletes a meal entry by ID
 *     tags: [Meal Management]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/mealId'
 *     responses:
 *       200:
 *         description: Meal entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Meal deleted successfully"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Meal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Meal not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!meal) {
      return res.status(404).json({ error: "Meal not found" })
    }

    res.json({ message: "Meal deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router