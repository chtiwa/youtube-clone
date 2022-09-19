const Comment = require('../models/Comment')
const Video = require('../models/Video')
const User = require('../models/User')

const createComment = async (req, res) => {
  try {
    const { videoId } = req.params
    // console.log(req.user)
    // console.log(req.body)
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    // const { value } = req.body
    const comment = await Comment.create({ ...req.body, userId: req.user.userId, userImage: user.imageUrl, username: user.username, videoId: videoId })
    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createNestedComment = async (req, res) => {
  try {
    // get the id of the parent comment
    const { parentId, videoId } = req.params
    // console.log(req.body)
    // get the id of the commenter
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    // create a nested comment 
    // const { value } = req.body
    const nestedComment = await Comment.create({ value: req.body.value, userImage: user.imageUrl, userId: req.user.userId, username: user.username, isNested: true, videoId: videoId })
    // push the nested (created) comment's _id into the parent comment
    const parentComment = await Comment.findByIdAndUpdate({ _id: parentId }, { $push: { nestedCommentsIds: nestedComment._id } }, { new: true })
    res.status(200).json({ nestedComment: nestedComment, parentComment: parentComment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getComments = async (req, res) => {
  try {
    const { videoId } = req.params
    // get the parent comments only
    const comments = await Comment.find({ videoId: videoId, isNested: false })
    const commentsNumber = Number(comments.length)
    await Video.findByIdAndUpdate({ _id: videoId }, { commentsNumber: commentsNumber }, { new: true })

    res.status(200).json(comments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getNestedComments = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const likeComment = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const unlikeComment = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { dislikes: req.user.userId } }, { new: true })
    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const undislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { $pull: { dislikes: req.user.userId } }, { new: true })
    res.status(200).json(comment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteComment = async (req, res) => {
  try {
    // send the parentId
    const { commentId } = req.params
    const { parentId } = req.body
    const comment = await Comment.findById({ _id: commentId })
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" })
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
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createComment, getComments, createNestedComment, getNestedComments, deleteComment, dislikeComment, undislikeComment, likeComment, unlikeComment }