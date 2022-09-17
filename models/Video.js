const mongoose = require('mongoose')

const VideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true
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
    // required: true
  },
  channelImageUrl: {
    type: String,
    // required: true
  },
  // thubnail img
  thumnailUrl: {
    type: String,
    // required: true
  },
  videoUrl: {
    type: String,
    required: true
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
    default: [],
    // unique: true
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    // unique: true
  },
  commentsNumber: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

module.exports = mongoose.model('Video', VideoSchema)