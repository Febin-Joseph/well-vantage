const Joi = require("joi")

const validateMood = (req, res, next) => {
  const schema = Joi.object({
    date: Joi.date().required(),
    mood: Joi.string().valid("happy", "content", "neutral", "stressed", "sad", "angry").required(),
    activity: Joi.string().valid("daily-checkin", "after-meditation", "after-workout").required(),
    notes: Joi.string().allow("", null).optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

const validateMeal = (req, res, next) => {
  const ingredientSchema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().positive().required(),
    unit: Joi.string().required(),
    calories: Joi.number().min(0).default(0),
    protein: Joi.number().min(0).default(0),
    carbs: Joi.number().min(0).default(0),
    fat: Joi.number().min(0).default(0),
    fiber: Joi.number().min(0).default(0),
    originalQuantity: Joi.number().optional(),
  }).unknown(true)

  const schema = Joi.object({
    date: Joi.string().isoDate().required(),
    mealType: Joi.string().valid("breakfast", "lunch", "dinner", "snack").required(),
    dishName: Joi.string().required(),
    ingredients: Joi.array().items(ingredientSchema).min(1).required(),
    nutritionValues: Joi.object({
      calories: Joi.number().min(0).optional(),
      protein: Joi.number().min(0).optional(),
      fats: Joi.number().min(0).optional(),
      fibre: Joi.number().min(0).optional(),
      sugar: Joi.number().min(0).optional(),
    }).optional(),
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

module.exports = { validateMood, validateMeal }