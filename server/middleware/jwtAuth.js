const { verifyAccessToken, verifyRefreshToken, generateTokens, getCookieOptions } = require('../utils/jwtUtils')
const User = require('../models/User')

const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  console.log('JWT Auth - Cookies received:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    cookies: Object.keys(req.cookies)
  })

  if (!accessToken && !refreshToken) {
    console.log('JWT Auth - No tokens provided')
    return res.status(401).json({ error: 'No tokens provided' })
  }

  if (accessToken) {
    const decoded = verifyAccessToken(accessToken)
    if (decoded) {
      try {
        const user = await User.findById(decoded.userId)
        if (user) {
          req.user = user
          
          const tokenExp = decoded.exp * 1000
          const now = Date.now()
          const timeUntilExpiry = tokenExp - now
          
          if (timeUntilExpiry < 15 * 60 * 1000 && refreshToken) {
            const refreshDecoded = verifyRefreshToken(refreshToken)
            if (refreshDecoded && refreshDecoded.userId === user._id.toString()) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user)
              
              res.cookie('accessToken', newAccessToken, getCookieOptions(false))
              res.cookie('refreshToken', newRefreshToken, getCookieOptions(true))
            }
          }
          
          return next()
        }
      } catch (error) {
        console.error('Error finding user:', error)
      }
    }
  }

  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken)
    if (decoded) {
      try {
        const user = await User.findById(decoded.userId)
        if (user && user.tokenVersion === decoded.tokenVersion) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user)
          
          res.cookie('accessToken', newAccessToken, getCookieOptions(false))
          res.cookie('refreshToken', newRefreshToken, getCookieOptions(true))
          
          req.user = user
          return next()
        }
      } catch (error) {
        console.error('Error refreshing tokens:', error)
      }
    }
  }

  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  
  return res.status(401).json({ error: 'Invalid or expired tokens' })
}

const optionalAuth = async (req, res, next) => {
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  if (!accessToken && !refreshToken) {
    return next()
  }

  try {
    await authenticateToken(req, res, next)
  } catch (error) {
    req.user = null
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth
}