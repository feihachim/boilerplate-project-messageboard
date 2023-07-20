const mongoose = require("mongoose");

const DATE = new Date();

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
    default: DATE,
  },
  bumped_on: {
    type: Date,
    default: DATE,
  },
  reported: {
    type: Boolean,
    default: false,
  },
  replies: [
    {
      type: Object,
    },
  ],
  board: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Thread", threadSchema);
