const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  username: {
    type: String
  },
  userImage: {
    type: String
  },
  value: {
    type: String,
    required: true
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  // when someone makes a comment on the parent comment
  nestedCommentsIds: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  isNested: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Comment', CommentSchema)