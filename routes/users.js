const express = require('express')
const router = express.Router()
const { likeVideo, unlikeVideo, undislikeVideo, dislikeVideo, subscribe, unsubscribe, setTheme, getChannel } = require('../controllers/users')
const auth = require('../middleware/authentication')

router.route('/theme').post(setTheme)
router.route('/sub/:channelId').patch(auth, subscribe)
router.route('/unsub/:channelId').patch(auth, unsubscribe)
router.route('/like/:videoId').patch(auth, likeVideo)
router.route('/unlike/:videoId').patch(auth, unlikeVideo)
router.route('/dislike/:videoId').patch(auth, dislikeVideo)
router.route('/undislike/:videoId').patch(auth, undislikeVideo)
router.route('/:channelId').get(getChannel)

module.exports = router