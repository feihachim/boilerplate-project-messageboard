const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
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
    default: new Date(),
  },
  reported: {
    type: Boolean,
    default: false,
  },
  thread_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Thread",
  },
});

module.exports = mongoose.model("Reply", replySchema);
