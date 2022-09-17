const User = require('../models/User')
const Video = require('../models/Video')
const Comment = require('../models/Comment')

const setTheme = async (req, res) => {
  try {
    const { theme } = req.body
    res
      .cookie("theme", theme, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
      })
      .status(200).json(theme)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const subscribe = async (req, res) => {
  try {
    // send the channel id
    const { channelId } = req.params
    const user = await User.findByIdAndUpdate({ _id: req.user.userId }, { $addToSet: { subscriptions: channelId } })
    const channel = await User.findByIdAndUpdate({ _id: channelId }, { $addToSet: { subscribers: req.user.userId } })
    // update the user's subscriptions
    res.status(200).json(channel)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const unsubscribe = async (req, res) => {
  try {
    const { channelId } = req.params
    const user = await User.findByIdAndUpdate({ _id: req.user.userId }, { $pull: { subscriptions: channelId } })
    const channel = await User.findByIdAndUpdate({ _id: channelId }, { $pull: { subscribers: req.user.userId } })
    // send subriptions
    res.status(200).json(channel)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const likeVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    if (!req.user.userId) {
      return res.stauts(401).json({ message: `Unauthorized` })
    }
    const likedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
      $addToSet: { likes: req.user.userId },
      $pull: { dislikes: req.user.userId }
    }, { new: true })
    // send has liked post
    res.status(200).json(likedVideo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const unlikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    if (!req.user.userId) {
      return res.stauts(401).json({ message: `Unauthorized` })
    }
    const unlikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
      $pull: { likes: req.user.userId },
    }, { new: true })
    res.status(200).json(unlikedVideo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const dislikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    if (!req.user.userId) {
      return res.status(401).json({ message: `Unauthorized` })
    }
    const dislikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
      $addToSet: { dislikes: req.user.userId },
      $pull: { likes: req.user.userId }
    }, { new: true })

    res.status(200).json(dislikedVideo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const undislikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    if (!req.user.userId) {
      return res.status(401).json({ message: `Unauthorized` })
    }
    const undislikedVideo = await Video.findByIdAndUpdate({ _id: videoId }, {
      $pull: { dislikes: req.user.userId }
    }, { new: true })

    res.status(200).json(undislikedVideo)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getChannel = async (req, res) => {
  try {
    const { channelId } = req.params
    const channel = await User.findById({ _id: channelId })
    res.status(200).json(channel)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    await User.findByIdAndDelete({ _id: userId })
    await Comment.deleteMany({ userId: userId })
    await Video.deleteMany({ userId: userId })
    res.status(200).json({ message: "User was deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { setTheme, subscribe, unsubscribe, likeVideo, unlikeVideo, dislikeVideo, undislikeVideo, getChannel }