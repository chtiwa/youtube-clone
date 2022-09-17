const User = require('../models/User')

// onGoogleSuccess
const authenticate = async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email })
    // console.log(user)
    const token = user.createJWT()
    if (user) {
      // console.log("11", user)
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
    // console.log("23", newUser)
    const newToken = newUser.createJWT()
    res.status(200)
      .cookie("token", newToken, {
        httpOnly: true,
        // maxAge is in milliseconds
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
      })
      .json({ user: newUser, isLoggedIn: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const logout = async (req, res) => {
  try {
    res
      .cookie("token", "", { maxAge: 0 })
      .status(200).json({ message: "Logged out successfully", isLoggedIn: false })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { logout, authenticate }