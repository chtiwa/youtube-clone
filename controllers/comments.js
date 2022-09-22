const Comment = require('../models/Comment')
const Video = require('../models/Video')
const User = require('../models/User')
const asyncWrapper = require('../middleware/async')
const BaseError = require('../errors/base-error')

const createComment = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  const user = await User.findById({ _id: req.user.userId })
  if (!user) {
    throw new BaseError('Unauthorized', 401)
  }
  // const { value } = req.body
  const comment = await Comment.create({ ...req.body, userId: req.user.userId, userImage: user.imageUrl, username: user.username, videoId: videoId })
  res.status(200).json(comment)
})

const createNestedComment = asyncWrapper(async (req, res) => {
  // get the id of the parent comment
  const { parentId, videoId } = req.params
  // console.log(req.body)
  // get the id of the commenter
  const user = await User.findById({ _id: req.user.userId })
  if (!user) {
    throw new BaseError('Unauthorized', 401)
  }
  // create a nested comment 
  // const { value } = req.body
  const nestedComment = await Comment.create({ value: req.body.value, userImage: user.imageUrl, userId: req.user.userId, username: user.username, isNested: true, videoId: videoId })
  // push the nested (created) comment's _id into the parent comment
  const parentComment = await Comment.findByIdAndUpdate({ _id: parentId }, { $push: { nestedCommentsIds: nestedComment._id } }, { new: true })
  res.status(200).json({ nestedComment: nestedComment, parentComment: parentComment })
})

const getComments = asyncWrapper(async (req, res) => {
  const { videoId, filter } = req.params
  // get the parent comments only based on the filter
  let comments
  if (filter === "mostRecent") {
    comments = await Comment.find({ videoId: videoId, isNested: false }).sort({ _id: -1 })
  } else {
    comments = await Comment.find({ videoId: videoId, isNested: false }).sort({ likes: -1 })
  }
  res.status(200).json(comments)
  // const commentsNumber = Number(comments.length)
  // await Video.findByIdAndUpdate({ _id: videoId }, { commentsNumber: commentsNumber }, { new: true })
})

const getNestedComments = asyncWrapper(async (req, res) => {
  const { parentId } = req.params
  // find the parent comment
  const comment = await Comment.findById({ _id: parentId })
  // find the nested comments
  const nestedComments = await Promise.all(
    comment.nestedCommentsIds.map((nestedCommentId) => {
      return Comment.findById({ _id: nestedCommentId })
    })
  )
  // console.log(nestedComments)
  res.status(200).json({ nestedComments: nestedComments, commentId: parentId })
})

const likeComment = asyncWrapper(async (req, res) => {
  const { commentId } = req.params
  const { parentId } = req.body
  const comment = await Comment.findById({ _id: commentId })
  if (comment.isNested) {
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $addToSet: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ nestedComment: comment, parentId: parentId, isNested: comment.isNested })
  } else {
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $addToSet: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ comment: comment, isNested: comment.isNested })
  }
})

const unlikeComment = asyncWrapper(async (req, res) => {
  const { commentId } = req.params
  const { parentId } = req.body
  const comment = await Comment.findById({ _id: commentId })
  if (comment.isNested) {
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ nestedComment: comment, parentId: parentId, isNested: comment.isNested })
  } else {
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { likes: req.user.userId } }, { new: true })
    res.status(200).json({ comment: comment, isNested: comment.isNested })
  }
})

const dislikeComment = asyncWrapper(async (req, res) => {
  const { commentId } = req.params
  const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { dislikes: req.user.userId } }, { new: true })
  res.status(200).json(comment)
})

const undislikeComment = asyncWrapper(async (req, res) => {
  const { commentId } = req.params
  const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { dislikes: req.user.userId } }, { new: true })
  res.status(200).json(comment)
})

const deleteComment = asyncWrapper(async (req, res) => {
  // send the parentId
  const { commentId } = req.params
  const { parentId } = req.body
  const comment = await Comment.findById({ _id: commentId })
  if (comment.userId.toString() !== req.user.userId) {
    throw new BaseError('Unauthorized', 401)
  }
  if (comment.isNested) {
    // find the parent comment and remove the nested comment id from it
    const parentComment = await Comment.findByIdAndUpdate({ _id: parentId }, { $pull: { nestedCommentsIds: comment._id } }, { new: true })
    // delete the nested comment
    const deletedComment = await Comment.findByIdAndDelete({ _id: comment._id })
    res.status(200).json({ isNested: true, nestedCommentId: deletedComment._id, parentComment: parentComment })
  } else {
    // find the parent comment and delete it  with the nested comments
    const parentComment = await Comment.findByIdAndDelete({ _id: commentId })
    // delete the nestedComments of the parent comment
    await Promise.all(
      parentComment.nestedCommentsIds.map((nestedCommentId) => {
        return Comment.findByIdAndDelete({ _id: nestedCommentId })
      })
    )
    res.status(200).json({ isNested: false, commentId: parentComment._id })
  }
})

module.exports = { createComment, getComments, createNestedComment, getNestedComments, deleteComment, dislikeComment, undislikeComment, likeComment, unlikeComment }