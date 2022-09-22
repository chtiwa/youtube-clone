const User = require('../models/User')
const asyncWrapper = require('../middleware/async')

// onGoogleSuccess
const authenticate = asyncWrapper(async (req, res) => {
  const { email } = req.body
  // console.log(req.body)
  const user = await User.findOne({ email: email })
  if (user) {
    const token = user.createJWT()
    return res.status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 3,
        sameSite: 'lax'
      })
      .json({ user: user, isLoggedIn: true })
  }
  // username email imageUrl 
  const newUser = await User.create({ ...req.body })
  const newToken = newUser.createJWT()
  res.status(200)
    .cookie("token", newToken, {
      httpOnly: true,
      // maxAge is in milliseconds
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'lax'
    })
    .json({ user: newUser, isLoggedIn: true })
})

const logout = asyncWrapper(async (req, res) => {
  res
    .cookie("token", "", { maxAge: 0 })
    .status(200).json({ message: "Logged out successfully", isLoggedIn: false })
})

module.exports = { logout, authenticate }