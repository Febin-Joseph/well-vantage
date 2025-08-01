const { verifyAccessToken, verifyRefreshToken, generateTokens, getCookieOptions } = require('../utils/jwtUtils')
const User = require('../models/User')

const authenticateToken = async (req, res, next) => {
  console.log('=== JWT AUTH START ===')
  console.log('Request URL:', req.url)
  console.log('Request method:', req.method)
  console.log('All cookies received:', req.cookies)
  console.log('Cookie header:', req.headers.cookie)
  
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  console.log('Token status:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenLength: accessToken ? accessToken.length : 0,
    refreshTokenLength: refreshToken ? refreshToken.length : 0
  })

  if (!accessToken && !refreshToken) {
    console.log('❌ JWT Auth - No tokens provided')
    console.log('=== JWT AUTH END (NO TOKENS) ===')
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