const Video = require('../models/Video')
const User = require('../models/User')
const Comment = require('../models/Comment')
const cloudinary = require('../utils/cloudinary')

const createVideo = async (req, res) => {
  try {
    const user = await User.findBydId({ _id: req.user.userId })
    if (!user) {
      return res.status(404).json({ message: `User wasn't found` })
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
    // const { title ,description, thubnail } = req.body
    const video = await Video.create({ ...req.body, thumbnailUrl: imageResult.secure_url, channelName: user.username, channelImageUrl: user.imageUrl })
    res.stat(201).json(video)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createVideoNext = async (req, res) => {
  try {
    const { videoId } = req.params
    const user = await User.findById({ _id: req.user.userId })
    if (!user) {
      return res.status(404).json({ message: `User wasn't found` })
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
    const video = await Video.findByIdAndUpdate({ _id: videoId }, { ...req.body, videoUrl: videoResult.secure_url, duration: videoResult.duration })
    res.status(200).json(video)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideos = async (req, res) => {
  try {
    const videos = await Video.aggregate([{
      $sample: { size: 20 }
    }])
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideo = async (req, res) => {
  try {
    const { id } = req.params
    const video = await Video.findByIdAndUpdate({ _id: id }, { $inc: { views: 1 } }, { new: true })
    console.log(req.user.userId)
    if (req.user.userId) {
      await User.findByIdAndUpdate({ _id: req.user.userId }, { $addToSet: { history: video._id } })
    }
    res.status(200).json(video)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideosBySearch = async (req, res) => {
  // in the search
  try {
    const { search } = req.query
    const videos = await Video.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } }
      ]
    })
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getTrendingVideos = async (req, res) => {
  try {
    const videos = await Video.find({}).limit(30).sort({ views: -1 })
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSearchResults = async (req, res) => {
  try {
    const { search } = req.query
    const results = await Video.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { channelName: { $regex: search, $options: "i" } }
      ]
    }, { _id: 0, title: 1 })
    res.status(200).json(results)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideosByTag = async (req, res) => {
  const { tag } = req.query
  try {
    const videos = await Video.find({ tags: { $in: [tag] } })
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideosBySubscriptions = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.userId })
    const videos = await Promise.all(
      user.subscriptions.map((subId) => {
        return Video.find({ userId: subId })
      })
    )
    // Promise.all returns an array
    res.status(200).json(videos[0])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideosByChannel = async (req, res) => {
  try {
    const { channelId } = req.params
    const videos = await Video.find({ userId: channelId })
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getRandomTags = async (req, res) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 20 } }])
    const tags = videos.map((video) => {
      return video.tags
    })
    res.status(200).json(tags)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVideosByHistory = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.userId })
    console.log(user.history)
    const videos = Promise.all(
      user.history.map((videoId) => {
        return Video.findById({ _id: videoId })
      })
    )
    res.status(200).json(videos[0])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params
    await Video.findByIdAndDelete({ _id: videoId })
    await Comment.deleteMany({ videoId: videoId })
    res.status(200).json({ message: "Video was deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { createVideo, createVideoNext, getVideos, getVideo, getVideosBySearch, getSearchResults, getVideosByTag, getVideosBySubscriptions, getVideosByChannel, getRandomTags, getVideosByHistory, getTrendingVideos }