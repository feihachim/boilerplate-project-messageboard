const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({});

module.exports = mongoose.model("Thread", threadSchema);
