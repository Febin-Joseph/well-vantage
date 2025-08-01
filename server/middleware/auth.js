const { authenticateToken } = require('./jwtAuth')

const requireAuth = (req, res, next) => {
  authenticateToken(req, res, next)
}

module.exports = { requireAuth }