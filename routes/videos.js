const express = require('express')
const router = express.Router()
const { createVideo, getVideos, getVideo, getSearchResults
  , getVideosBySearch, getVideosByTag, getVideosBySubscriptions, getVideosByChannel, getRandomTags, getVideosByHistory, createVideoNext, getTrendingVideos } = require('../controllers/videos')
const uploadVideo = require('../utils/multerVideo')
const uploadImage = require('../utils/multerImage')
const auth = require('../middleware/authentication')

// /api/videos
router.route('/').get(getVideos).post(auth, uploadImage.single('image'), createVideo)
router.route('/next/:videoId').post(auth, uploadVideo.single('video'), createVideoNext)
router.route('/tags').get(getRandomTags)
router.route('/subs').get(auth, getVideosBySubscriptions)
// results?search=traversy
router.route('/results').get(getVideosBySearch)
// searchResults?search=traversy
router.route('/searchResults').get(getSearchResults)
// category?tag=traversy
router.route('/category').get(getVideosByTag)
router.route('/trending').get(getTrendingVideos)
router.route('/history').get(auth, getVideosByHistory)
router.route('/channel/:channelId').get(getVideosByChannel)
router.route('/:id').get(getVideo)

module.exports = router