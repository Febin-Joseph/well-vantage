const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const session = require("express-session")
const passport = require("passport")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const cookieParser = require("cookie-parser")

const connectDB = require("./config/database")
const swaggerOptions = require("./config/swagger")
const authRoutes = require("./routes/auth")
const moodRoutes = require("./routes/mood")
const mealRoutes = require("./routes/meals")
const chatRoutes = require("./routes/chat")
const { errorHandler } = require("./middleware/errorHandler")
const { notFound } = require("./middleware/notFound")

require("dotenv").config()
require("./config/passport")

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(helmet())
app.use(compression())
app.use(morgan("combined"))

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      console.log('CORS: Allowing request with no origin')
      return callback(null, true)
    }

    const allowedOrigins = [
      'https://well-vantage.vercel.app',
    ]

    if (process.env.CLIENT_URL) {
      allowedOrigins.push(process.env.CLIENT_URL)
    }

    console.log('CORS: Checking origin:', origin)
    console.log('CORS: Allowed origins:', allowedOrigins)

    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS: Origin allowed')
      callback(null, true)
    } else {
      console.log('CORS: Origin blocked:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

const specs = swaggerJsdoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

app.use("/api/auth", authRoutes)
app.use("/api/mood", moodRoutes)
app.use("/api/meals", mealRoutes)
app.use("/api/chat", chatRoutes)

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *             example:
 *               status: "OK"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.get("/api/test-cookies", (req, res) => {
  console.log('Test cookies endpoint - all cookies:', req.cookies)
  res.json({
    cookies: req.cookies,
    headers: req.headers.cookie ? 'present' : 'missing'
  })
})

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
