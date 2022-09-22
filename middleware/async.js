const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      // next throws the error down the middleware chain until it reaches the app.use()
      next(error)
    }
  }
}

module.exports = asyncWrapper