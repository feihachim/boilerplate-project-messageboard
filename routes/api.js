"use strict";

const bcrypt = require("bcrypt");

const Thread = require("../models/thread");
const Reply = require("../models/reply");

const saltRounds = 10;

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
          delete_password: bcrypt.hashSync(delete_password, saltRounds),
          board: board,
        });
        newThread.save().then((threadSaved) => {
          if (!threadSaved) {
            res.send("error no thread saved");
            return;
          }
          res.send(threadSaved);
        });
      } catch (error) {
        console.log(error);
      }
    })
    .put(function (req, res) {
      const board = req.params.board;
      const thread_id = req.body.thread_id;
      try {
        Thread.findOne({ board: board, _id: thread_id }).then((thread) => {
          if (!thread) {
            res.send("error no thread");
            return;
          }
          thread.reported = true;
          thread.save().then((threadUpdated) => {
            if (threadUpdated) {
              res.send("reported");
            }
          });
        });
      } catch (error) {
        console.log(error);
      }
    })
    .delete(function (req, res) {
      const thread_id = req.body.thread_id;
      const delete_password = req.body.delete_password;
      Thread.findById(thread_id).then((thread) => {
        if (!thread) {
          res.send("error no thread");
          return;
        }
        if (!bcrypt.compareSync(delete_password, thread.delete_password)) {
          res.send("incorrect password");
        } else {
          Thread.deleteOne({ _id: thread._id }).then(() => {
            res.send("success");
          });
        }
      });
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
            delete_password: bcrypt.hashSync(delete_password, saltRounds),
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
              res.send(newReply);
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    })
    .put(function (req, res) {
      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      try {
        Reply.findOne({ _id: reply_id, thread_id: thread_id }).then((reply) => {
          if (!reply) {
            res.send("no reply");
            return;
          }
          reply.reported = true;
          Thread.findOne({ _id: thread_id, board: board }).then((thread) => {
            if (!thread) {
              res.send("error no thread");
              return;
            }
            thread.bumped_on = new Date();
            let replyList = thread.replies.filter(
              (element) => element._id !== reply_id
            );
            replyList.push(reply);
            thread.replies = replyList;
            thread.save().then((threadUpdated) => {
              if (threadUpdated) {
                res.send("reported");
              }
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    })
    .delete(function (req, res) {
      const board = req.params.board;
      const thread_id = req.body.thread_id;
      const reply_id = req.body.reply_id;
      const delete_password = req.body.delete_password;
      Reply.findOne({ _id: reply_id, thread_id: thread_id }).then((reply) => {
        if (!reply) {
          res.send("error no reply");
          return;
        }
        if (!bcrypt.compareSync(delete_password, reply.delete_password)) {
          res.send("incorrect password");
        } else {
          reply.text = "[deleted]";
          reply.save().then((replyDeleted) => {
            if (replyDeleted) {
              Thread.findById(thread_id).then((thread) => {
                let replyList = thread.replies.filter(
                  (element) => element._id != reply_id
                );
                replyList.push(reply);
                thread.replies = replyList;
                thread.save().then((threadUpdated) => {
                  res.send("success");
                });
              });
            }
          });
        }
      });
    });
};
