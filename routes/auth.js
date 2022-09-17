const express = require('express')
const router = express.Router()
const { authenticate, logout } = require('../controllers/auth')

router.route('/').post(authenticate)
router.route('/logout').get(logout)

module.exports = router