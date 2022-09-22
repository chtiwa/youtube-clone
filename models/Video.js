const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
  },
  channelImageUrl: {
    type: String,
  },
  // thubnail img
  thumbnailUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  duration: {
    type: String,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  commentsNumber: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Video', VideoSchema)