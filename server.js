require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const connectDB = require('./db/connect')
const errorHandler = require('./middleware/error-handler')
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const videosRoutes = require('./routes/videos')
const commentsRoutes = require('./routes/comments')
const path = require('path')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

app.use(css())
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
}))
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
      "media-src": ["'self'", "https: data:"]
    }
  })
)

app.use(cors({ origin: [process.env.CLIENT], credentials: true }))
app.use(cookieParser())
app.use(bodyParser.json({ limit: "100mb" }))
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/videos', videosRoutes)
app.use('/api/comments', commentsRoutes)

app.use(errorHandler)

app.use(express.static(path.join(__dirname, "/build")))

https://facebook-clone-chtiwa.herokuapp.com

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => console.log(`Server is listening on port : ${port}`))
  } catch (error) {
    console.log(error)
  }
}

start()