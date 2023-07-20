"use strict";

const Thread = require("../models/thread");
const Reply = require("../models/reply");

module.exports = function (app) {
  app
    .route("/api/threads/:board")
    .get(function (req, res) {
      const board = req.params.board;
      try {
        Thread.find({ board: board })
          .sort({ bumped_on: "desc" })
          .limit(10)
          .then((threads) => {
            const threadList = threads.map((thread) => {
              let replyList = thread.replies
                .sort((a, b) => b.created_on - a.created_on)
                .filter((element, index) => index < 3)
                .map((element) => {
                  return {
                    _id: element._id,
                    text: element.text,
                    created_on: element.created_on,
                  };
                });
              return {
                _id: thread._id,
                text: thread.text,
                created_on: thread.created_on,
                bumped_on: thread.bumped_on,
                replies: replyList,
              };
            });
            res.send(threadList);
          });
      } catch (error) {
        console.log(error);
      }
    })
    .post(function (req, res) {
      const board = req.params.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      try {
        const newThread = new Thread({
          text: text,
          delete_password: delete_password,
          board: board,
        });
        newThread.save().then((threadSaved) => {
          if (!threadSaved) {
            res.send("error no thread saved");
            return;
          }
          res.status(303).redirect(`/b/${board}`);
        });
      } catch (error) {
        console.log(error);
      }
    })
    .put(function (req, res) {})
    .delete(function (req, res) {
      const thread_id = req.body.thread_id;
      const delete_password = req.body.delete_password;
    });

  app
    .route("/api/replies/:board")
    .get(function (req, res) {
      const board = req.params.board;
      const thread_id = req.query.thread_id;
      try {
        Thread.findOne({ board: board, _id: thread_id }).then((thread) => {
          let replyList = thread.replies.map((element) => {
            return {
              _id: element._id,
              text: element.text,
              created_on: element.created_on,
            };
          });
          res.send({
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: replyList,
          });
        });
      } catch (error) {
        console.log(error);
      }
    })
    .post(function (req, res) {
      const board = req.params.board;
      const text = req.body.text;
      const delete_password = req.body.delete_password;
      const thread_id = req.body.thread_id;
      try {
        Thread.findOne({ board: board, _id: thread_id }).then((thread) => {
          if (!thread) {
            res.send("error:no thread");
            return;
          }
          const newDate = new Date();
          const newReply = new Reply({
            text: text,
            delete_password: delete_password,
            created_on: newDate,
            thread_id: thread._id,
          });
          newReply.save().then((replySaved) => {
            if (!replySaved) {
              res.send("error no reply saved");
              return;
            }
            thread.bumped_on = newDate;
            thread.replies.push(newReply);
            thread.save().then((threadUpdated) => {
              if (!threadUpdated) {
                res.send("error no thread updated");
                return;
              }
              res.status(303).redirect(`/b/${board}/${thread._id}`);
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    })
    .put(function (req, res) {})
    .delete(function (req, res) {});
};
