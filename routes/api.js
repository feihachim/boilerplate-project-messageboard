"use strict";

const Thread = require("../models/thread");
const Reply = require("../models/reply");
const bcrypt = require("bcrypt");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get(function (req, res) {})
    .post(function (req, res) {})
    .put(function (req, res) {})
    .delete(function (req, res) {});

  app
    .route("/api/replies/:board")
    .get(function (req, res) {})
    .post(function (req, res) {})
    .put(function (req, res) {})
    .delete(function (req, res) {});
};
