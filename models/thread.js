const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  delete_password: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    default: Date.now(),
  },
  bumped_on: {
    type: Date,
    default: Date.now(),
  },
  reported: {
    type: Boolean,
    default: false,
  },
  replies: {
    type: [mongoose.Schema.ObjectId],
    ref: "Reply",
    default: [],
  },
});

module.exports = mongoose.model("Thread", threadSchema);
