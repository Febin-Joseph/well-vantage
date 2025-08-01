const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Well-Vantage Wellness API",
      version: "1.0.0",
      description: `

A comprehensive wellness tracking application that helps users monitor their mood, nutrition, and overall health.

### Features
- **Authentication**: Google OAuth integration with JWT tokens
- **Mood Tracking**: Daily mood monitoring with activity correlation
- **Nutrition Management**: Meal tracking with detailed nutritional analysis
- **AI-Powered Chat**: Food analysis and dish suggestions using AI
- **Health Analytics**: Comprehensive health data visualization

### Base URL
- **Development**: http://localhost:5000
- **Production**: https://your-production-url.com/api
      `
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production" 
          ? "https://your-production-url.com/api" 
          : "http://localhost:5000/api",
        description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session cookie for authentication",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "JWT access token cookie",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
              example: "Authentication failed"
            },
            status: {
              type: "number",
              description: "HTTP status code",
              example: 401
            }
          }
        },
        Success: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Success message",
              example: "Operation completed successfully"
            }
          }
        },
        User: {
          type: "object",
          properties: {
            _id: { 
              type: "string", 
              description: "Unique user identifier",
              example: "507f1f77bcf86cd799439011"
            },
            googleId: { 
              type: "string", 
              description: "Google OAuth ID",
              example: "123456789012345678901"
            },
            name: { 
              type: "string", 
              description: "User's full name",
              example: "John Doe"
            },
            email: { 
              type: "string", 
              description: "User's email address",
              example: "john.doe@example.com"
            },
            avatar: { 
              type: "string", 
              description: "User's profile picture URL",
              example: "https://lh3.googleusercontent.com/a/ACg8ocJ..."
            },
            createdAt: { 
              type: "string", 
              format: "date-time",
              description: "Account creation timestamp",
              example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: { 
              type: "string", 
              format: "date-time",
              description: "Last update timestamp",
              example: "2024-01-15T10:30:00.000Z"
            }
          },
          required: ["_id", "name", "email"]
        },
        Mood: {
          type: "object",
          properties: {
            _id: { 
              type: "string", 
              description: "Unique mood entry identifier",
              example: "507f1f77bcf86cd799439012"
            },
            userId: { 
              type: "string", 
              description: "User ID who created this entry",
              example: "507f1f77bcf86cd799439011"
            },
            date: { 
              type: "string", 
              format: "date-time",
              description: "Date and time of the mood entry",
              example: "2024-01-15T10:30:00.000Z"
            },
            mood: {
              type: "string",
              enum: ["happy", "content", "neutral", "stressed", "sad", "angry"],
              description: "Mood level",
              example: "happy"
            },
            activity: {
              type: "string",
              enum: ["daily-checkin", "after-meditation", "after-workout"],
              description: "Activity context when mood was recorded",
              example: "daily-checkin"
            },
            notes: { 
              type: "string", 
              description: "Additional notes about the mood",
              example: "Feeling great after morning workout"
            },
            createdAt: { 
              type: "string", 
              format: "date-time",
              description: "Entry creation timestamp",
              example: "2024-01-15T10:30:00.000Z"
            },
            updatedAt: { 
              type: "string", 
              format: "date-time",
              description: "Last update timestamp",
              example: "2024-01-15T10:30:00.000Z"
            }
          },
          required: ["userId", "date", "mood", "activity"]
        },
        Meal: {
          type: "object",
          properties: {
            _id: { 
              type: "string", 
              description: "Unique meal identifier",
              example: "507f1f77bcf86cd799439013"
            },
            userId: { 
              type: "string", 
              description: "User ID who created this meal",
              example: "507f1f77bcf86cd799439011"
            },
            date: { 
              type: "string", 
              format: "date-time",
              description: "Date and time of the meal",
              example: "2024-01-15T12:00:00.000Z"
            },
            mealType: {
              type: "string",
              enum: ["breakfast", "lunch", "dinner", "snack"],
              description: "Type of meal",
              example: "lunch"
            },
            dishName: { 
              type: "string", 
              description: "Name of the dish",
              example: "Grilled Chicken Salad"
            },
            ingredients: {
              type: "array",
              description: "List of ingredients in the meal",
              items: {
                type: "object",
                properties: {
                  name: { 
                    type: "string", 
                    description: "Ingredient name",
                    example: "Chicken breast"
                  },
                  quantity: { 
                    type: "number", 
                    description: "Quantity of ingredient",
                    example: 150
                  },
                  unit: { 
                    type: "string", 
                    description: "Unit of measurement",
                    example: "g"
                  },
                  calories: { 
                    type: "number", 
                    description: "Calories per unit",
                    example: 165
                  },
                  protein: { 
                    type: "number", 
                    description: "Protein content in grams",
                    example: 31
                  },
                  carbs: { 
                    type: "number", 
                    description: "Carbohydrate content in grams",
                    example: 0
                  },
                  fat: { 
                    type: "number", 
                    description: "Fat content in grams",
                    example: 3.6
                  },
                  fiber: { 
                    type: "number", 
                    description: "Fiber content in grams",
                    example: 0
                  }
                },
                required: ["name", "quantity", "unit"]
              }
            },
            totalCalories: { 
              type: "number", 
              description: "Total calories in the meal",
              example: 450
            },
            totalProtein: { 
              type: "number", 
              description: "Total protein in grams",
              example: 35
            },
            totalCarbs: { 
              type: "number", 
              description: "Total carbohydrates in grams",
              example: 25
            },
            totalFat: { 
              type: "number", 
              description: "Total fat in grams",
              example: 12
            },
            totalFiber: { 
              type: "number", 
              description: "Total fiber in grams",
              example: 8
            },
            createdAt: { 
              type: "string", 
              format: "date-time",
              description: "Meal creation timestamp",
              example: "2024-01-15T12:00:00.000Z"
            },
            updatedAt: { 
              type: "string", 
              format: "date-time",
              description: "Last update timestamp",
              example: "2024-01-15T12:00:00.000Z"
            }
          },
          required: ["userId", "date", "mealType", "dishName"]
        },
        FoodAnalysis: {
          type: "object",
          properties: {
            foodItem: {
              type: "string",
              description: "Name of the analyzed food item",
              example: "apple"
            },
            nutrition: {
              type: "object",
              properties: {
                calories: { type: "number", example: 95 },
                protein: { type: "number", example: 0.5 },
                carbs: { type: "number", example: 25 },
                fat: { type: "number", example: 0.3 },
                fiber: { type: "number", example: 4.4 }
              }
            },
            healthBenefits: {
              type: "array",
              items: { type: "string" },
              example: ["Rich in fiber", "Contains antioxidants", "Low in calories"]
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
              example: ["Good for weight management", "Excellent source of vitamin C"]
            }
          }
        },
        DishSuggestion: {
          type: "object",
          properties: {
            dishes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Grilled Salmon with Vegetables" },
                  description: { type: "string", example: "Healthy grilled salmon with seasonal vegetables" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"], example: "medium" },
                  prepTime: { type: "number", example: 30 },
                  nutrition: {
                    type: "object",
                    properties: {
                      calories: { type: "number", example: 350 },
                      protein: { type: "number", example: 40 },
                      carbs: { type: "number", example: 15 },
                      fat: { type: "number", example: 18 }
                    }
                  }
                }
              }
            }
          }
        },
        DishIngredients: {
          type: "object",
          properties: {
            dishName: { type: "string", example: "Grilled Salmon with Vegetables" },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Salmon fillet" },
                  quantity: { type: "number", example: 200 },
                  unit: { type: "string", example: "g" },
                  calories: { type: "number", example: 280 },
                  protein: { type: "number", example: 40 },
                  carbs: { type: "number", example: 0 },
                  fat: { type: "number", example: 12 },
                  fiber: { type: "number", example: 0 }
                }
              }
            },
            instructions: {
              type: "array",
              items: { type: "string" },
              example: [
                "Preheat grill to medium-high heat",
                "Season salmon with salt and pepper",
                "Grill for 6-8 minutes per side"
              ]
            }
          }
        }
      },
      parameters: {
        startDate: {
          name: "startDate",
          in: "query",
          description: "Start date for filtering (YYYY-MM-DD format)",
          required: false,
          schema: {
            type: "string",
            format: "date",
            example: "2024-01-01"
          }
        },
        endDate: {
          name: "endDate",
          in: "query",
          description: "End date for filtering (YYYY-MM-DD format)",
          required: false,
          schema: {
            type: "string",
            format: "date",
            example: "2024-01-31"
          }
        },
        mealId: {
          name: "id",
          in: "path",
          description: "Unique meal identifier",
          required: true,
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439013"
          }
        },
        moodId: {
          name: "id",
          in: "path",
          description: "Unique mood entry identifier",
          required: true,
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439012"
          }
        }
      }
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints"
      },
      {
        name: "Mood Tracking",
        description: "Mood monitoring and tracking endpoints"
      },
      {
        name: "Meal Management",
        description: "Meal tracking and nutrition management endpoints"
      },
      {
        name: "AI Chat",
        description: "AI-powered food analysis and dish suggestions"
      },
      {
        name: "Health",
        description: "Health and system status endpoints"
      }
    ]
  },
  apis: ["./routes/*.js"],
}

module.exports = swaggerOptions