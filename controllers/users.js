const User = require('../models/User')
const Video = require('../models/Video')
const Comment = require('../models/Comment')
const asyncWrapper = require('../middleware/async')
const BaseError = require('../errors/base-error')

const subscribe = asyncWrapper(async (req, res) => {
  const { channelId } = req.params
  const user = await User.findByIdAndUpdate({ _id: req.user.userId }, { $addToSet: { subscriptions: channelId } }, { new: true })
  const channel = await User.findByIdAndUpdate({ _id: channelId }, { $addToSet: { subscribers: req.user.userId } }, { new: true })
  // update the user's subscriptions
  res.status(200).json(channel)
})

const unsubscribe = asyncWrapper(async (req, res) => {
  const { channelId } = req.params
  const user = await User.findByIdAndUpdate({ _id: req.user.userId }, { $pull: { subscriptions: channelId } }, { new: true })
  const channel = await User.findByIdAndUpdate({ _id: channelId }, { $pull: { subscribers: req.user.userId } }, { new: true })
  // send subriptions
  res.status(200).json(channel)
})

const likeVideo = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  if (!req.user.userId) {
    throw new BaseError("Unauthorized", 401)
  }
  const likedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
    $addToSet: { likes: req.user.userId },
    $pull: { dislikes: req.user.userId }
  }, { new: true })
  // send has liked post
  res.status(200).json(likedVideo)
})

const unlikeVideo = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  if (!req.user.userId) {
    throw new BaseError("Unauthorized", 401)
  }
  const unlikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
    $pull: { likes: req.user.userId },
  }, { new: true })
  res.status(200).json(unlikedVideo)
})

const dislikeVideo = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  if (!req.user.userId) {
    // return res.status(401).json({ message: `Unauthorized` })
    throw new BaseError('Unauthorized', 401)
  }
  const dislikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
    $addToSet: { dislikes: req.user.userId },
    $pull: { likes: req.user.userId }
  }, { new: true })

  res.status(200).json(dislikedVideo)
})

const undislikeVideo = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  if (!req.user.userId) {
    return res.status(401).json({ message: `Unauthorized` })
  }
  const undislikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
    $pull: { dislikes: req.user.userId }
  }, { new: true })

  res.status(200).json(undislikedVideo)
})

const getChannel = asyncWrapper(async (req, res) => {
  const { channelId } = req.params
  let channel
  if (channelId === "undefined") {
    return res.status(404).json({})
  }
  channel = await User.findById({ _id: channelId })
  res.status(200).json(channel)
})

const deleteUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params
  await User.findByIdAndDelete({ _id: userId })
  await Comment.deleteMany({ userId: userId })
  await Video.deleteMany({ userId: userId })
  res.status(200).json({ message: "User was deleted" })
})

module.exports = { subscribe, unsubscribe, likeVideo, unlikeVideo, dislikeVideo, undislikeVideo, getChannel }