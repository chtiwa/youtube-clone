const express = require('express')
const router = express.Router()
const { createComment, getComments, createNestedComment, getNestedComments, deleteComment, likeComment, dislikeComment, unlikeComment, undislikeComment } = require('../controllers/comments')
const auth = require('../middleware/authentication')

router.route('/like/:commentId').patch(auth, likeComment)
router.route('/unlike/:commentId').patch(auth, unlikeComment)
router.route('/dislike/:commentId').patch(auth, dislikeComment)
router.route('/undislike/:commentId').patch(auth, undislikeComment)
router.route('/delete/:commentId').delete(auth, deleteComment)
router.route('/nested/:parentId').get(getNestedComments)
router.route('/nested/:videoId/:parentId').post(auth, createNestedComment)
router.route('/:videoId').post(auth, createComment)
router.route('/:videoId/:filter').get(getComments)

module.exports = router