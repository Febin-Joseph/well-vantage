const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'

const ACCESS_TOKEN_EXPIRY = '4h'
const REFRESH_TOKEN_EXPIRY = '30d'

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user._id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )

  const refreshToken = jwt.sign(
    { 
      userId: user._id,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )

  return { accessToken, refreshToken }
}

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

const getCookieOptions = (isRefreshToken = false) => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  }

  if (isRefreshToken) {
    options.maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
  } else {
    options.maxAge = 4 * 60 * 60 * 1000 // 4 hours
  }

  return options
}

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getCookieOptions,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY
}