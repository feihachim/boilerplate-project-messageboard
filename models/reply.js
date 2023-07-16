const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({});

module.exports = mongoose.model("Reply", replySchema);
