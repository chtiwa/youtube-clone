const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: payload.userId, username: payload.username }
    // console.log(req.user)
    next()
  } catch (error) {
    res.status(401).json({ message: "Unauthorized!" })
  }
};

module.exports = auth