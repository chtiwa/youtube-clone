const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  username: {
    type: String, required: true
  },
  email: {
    type: String, required: true
  },
  imageUrl: {
    type: String
  },
  subscribers: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  subscriptions: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  history: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  }
}, { timestamps: true })

UserSchema.methods.createJWT = function () {
  return jwt.sign({ username: this.username, userId: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
}


module.exports = mongoose.model("User", UserSchema)