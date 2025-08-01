const express = require("express")
const passport = require("passport")
const User = require("../models/User")
const { generateTokens, getCookieOptions } = require("../utils/jwtUtils")
const router = express.Router()

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     description: Redirects user to Google OAuth consent screen for authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 *         headers:
 *           Location:
 *             description: Google OAuth URL
 *             schema:
 *               type: string
 *               example: https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=...
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     description: Handles the callback from Google OAuth after successful authentication. Sets JWT tokens as cookies and redirects to dashboard.
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google OAuth
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirects to dashboard on success or login page on failure
 *         headers:
 *           Set-Cookie:
 *             description: JWT tokens set as cookies (on success)
 *             schema:
 *               type: string
 *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
 *           Location:
 *             description: Redirect URL to dashboard (success) or login page (failure)
 *             schema:
 *               type: string
 *               example: https://well-vantage.vercel.app/dashboard
 *       400:
 *         description: Authentication failed - redirects to login page with error
 *         headers:
 *           Location:
 *             description: Redirect URL to login with error
 *             schema:
 *               type: string
 *               example: https://well-vantage.vercel.app/auth?error=authentication_failed
 */
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(process.env.CLIENT_URL || "https://well-vantage.vercel.app/auth?error=authentication_failed")
    }

    const { accessToken, refreshToken } = generateTokens(req.user)

    res.cookie('accessToken', accessToken, getCookieOptions(false))
    res.cookie('refreshToken', refreshToken, getCookieOptions(true))

    res.redirect(process.env.CLIENT_URL || "https://well-vantage.vercel.app/dashboard")
  } catch (error) {
    console.error('Auth callback error:', error)
    res.redirect(process.env.CLIENT_URL || "https://well-vantage.vercel.app/auth?error=token_generation_failed")
  }
})

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get current user information
 *     description: Retrieves the currently authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               googleId: "123456789012345678901"
 *               name: "John Doe"
 *               email: "john.doe@example.com"
 *               avatar: "https://lh3.googleusercontent.com/a/ACg8ocJ..."
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Not authenticated"
 */
router.get("/user", (req, res) => {
  if (req.user) {
    const { password, tokenVersion, ...userData } = req.user.toObject()
    res.json(userData)
  } else {
    res.status(401).json({ error: "Not authenticated" })
  }
})

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the current user by invalidating their session and clearing JWT tokens
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Logged out successfully"
 *         headers:
 *           Set-Cookie:
 *             description: Clears authentication cookies
 *             schema:
 *               type: string
 *               example: accessToken=; Max-Age=0; Path=/; HttpOnly; refreshToken=; Max-Age=0; Path=/; HttpOnly
 *       500:
 *         description: Logout failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Logout failed"
 */
router.post("/logout", async (req, res) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } })
    }

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: "Logout failed" })
  }
})

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT tokens
 *     description: Refreshes the user's access token using their refresh token. Used to maintain user session without requiring re-authentication.
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       description: Refresh token is automatically read from cookies
 *       required: false
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               message: "Tokens refreshed successfully"
 *         headers:
 *           Set-Cookie:
 *             description: New JWT tokens set as cookies
 *             schema:
 *               type: string
 *               example: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
 *       401:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Invalid refresh token"
 *       500:
 *         description: Token refresh failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Token refresh failed"
 */
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" })
  }

  try {
    const { verifyRefreshToken, generateTokens, getCookieOptions } = require("../utils/jwtUtils")
    const decoded = verifyRefreshToken(refreshToken)
    
    if (!decoded) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    const user = await User.findById(decoded.userId)
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user)

    res.cookie('accessToken', newAccessToken, getCookieOptions(false))
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(true))

    res.json({ message: "Tokens refreshed successfully" })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: "Token refresh failed" })
  }
})

module.exports = router