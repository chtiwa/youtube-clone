require('dotenv').config()
const Video = require('../models/Video')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const Comment = require('../models/Comment')
const cloudinary = require('../utils/cloudinary')
const asyncWrapper = require('../middleware/async')
const BaseError = require('../errors/base-error')

const createVideo = asyncWrapper(async (req, res) => {
  const user = await User.findById({ _id: req.user.userId })
  if (!user) {
    throw new BaseError("Unauthorized", 401)
  }
  const options = {
    folder: "home/youtube-clone",
    resource_type: "auto",
    use_filename: true,
    unique_filename: false,
    overwrite: true
  }
  let imageResult
  if (req?.file?.path) {
    imageResult = await cloudinary.uploader.upload(req.file.path, options)
  }
  // const { title ,description, thumbnail } = req.body
  // console.log(req.body)
  const video = await Video.create({ ...req.body, thumbnailUrl: imageResult.secure_url, channelName: user.username, channelImageUrl: user.imageUrl, userId: user._id })
  res.status(201).json(video)
})

const createVideoNext = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  const user = await User.findById({ _id: req.user.userId })
  if (!user) {
    throw new BaseError("Unauthorized", 401)
  }
  const options = {
    folder: "home/youtube-clone",
    resource_type: "auto",
    use_filename: true,
    unique_filename: false,
    overwrite: true
  }
  let videoResult
  if (req?.file?.path) {
    videoResult = await cloudinary.uploader.upload(req.file.path, options)
  }
  // const { tags } = req.body
  // console.log(videoResult)
  if (videoResult === undefined) {
    throw new BaseError("Video was not found!", 404)
  }
  const video = await Video.findByIdAndUpdate({ _id: videoId }, { tags: req.body.tags, videoUrl: videoResult.secure_url, duration: videoResult.duration })
  res.status(200).json(video)
})

const getVideos = asyncWrapper(async (req, res) => {
  const videos = await Video.aggregate([{
    $sample: { size: 20 }
  }])
  res.status(200).json(videos)
})

const getVideo = asyncWrapper(async (req, res) => {
  const { id } = req.params
  // console.log(id)
  const { token } = req.cookies
  let payload
  if (token) {
    payload = jwt.verify(token, process.env.JWT_SECRET)
  }
  const video = await Video.findByIdAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true })
  if (token && payload.userId) {
    const user = await User.findByIdAndUpdate({ _id: payload.userId }, { $addToSet: { history: video._id } }, { new: true })
    // console.log(user.history)
  }
  res.status(200).json(video)
})

const getVideosBySearch = asyncWrapper(async (req, res) => {
  // in the search
  const { search } = req.query
  const videos = await Video.find({
    $or: [
      { title: { $regex: search, $options: "i" } },
      { channelName: { $regex: search, $options: "i" } }
    ]
  })
  res.status(200).json(videos)
})

const getTrendingVideos = asyncWrapper(async (req, res) => {
  const videos = await Video.find({}).limit(30).sort({ views: -1 })
  res.status(200).json(videos)
})

const getSearchResults = asyncWrapper(async (req, res) => {
  const { search } = req.query
  const results = await Video.find({
    $or: [
      { title: { $regex: search, $options: "i" } },
      { channelName: { $regex: search, $options: "i" } }
    ]
  }, { _id: 0, title: 1 })
  res.status(200).json(results)
})

const getVideosByTag = asyncWrapper(async (req, res) => {
  const { tag } = req.query
  const videos = await Video.find({ tags: { $in: [tag] } })
  res.status(200).json(videos)
})

const getVideosBySubscriptions = asyncWrapper(async (req, res) => {
  const user = await User.findById({ _id: req.user.userId })
  const videos = await Promise.all(
    user.subscriptions.map((subId) => {
      return Video.find({ userId: subId })
    })
  )
  // Promise.all returns an array
  res.status(200).json(videos[0])
})

const getVideosByChannel = asyncWrapper(async (req, res) => {
  const { channelId } = req.params
  const videos = await Video.find({ userId: channelId })
  res.status(200).json(videos)
})

const getRandomTags = asyncWrapper(async (req, res) => {
  const videos = await Video.aggregate([{ $sample: { size: 20 } }])
  const tags = videos.map((video) => {
    return video.tags
  })
  res.status(200).json(tags)
})

const getVideosByHistory = asyncWrapper(async (req, res) => {
  const user = await User.findById({ _id: req.user.userId })
  // console.log(user.username)
  const videos = await Promise.all(
    user.history.map((videoId) => {
      return Video.findById({ _id: videoId })
    })
  )
  res.status(200).json(videos)
})

const deleteVideo = asyncWrapper(async (req, res) => {
  const { videoId } = req.params
  await Video.findByIdAndDelete({ _id: videoId })
  await Comment.deleteMany({ videoId: videoId })
  res.status(200).json({ message: "Video was deleted" })
})

module.exports = { createVideo, createVideoNext, getVideos, getVideo, getVideosBySearch, getSearchResults, getVideosByTag, getVideosBySubscriptions, getVideosByChannel, getRandomTags, getVideosByHistory, getTrendingVideos }