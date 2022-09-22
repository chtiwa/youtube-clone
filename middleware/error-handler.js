const BaseError = require('../errors/base-error')

const errorHandler = (err, req, res, next) => {
  console.log(err)
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({ message: err.message })
  }
  let error = { ...err }
  if (err.name === "CastError") {
    // console.log(err)
    error = new BaseError("Ressource not found", 404)
  } else if (err.name === "Validation error") {
    // console.log(err)
    const message = Object.values(err.errors).map(err => err.message).join("")
    error = new BaseError(message, 400)
  } else if (err.code === 11000) {
    // console.log(err)
    error = new BaseError("Duplicate field was entered", 400)
  }

  res.status(error.statusCode || 500).json({ message: error.message || "Internal server error!" })
}

module.exports = errorHandler