const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let thread_id;
  let reply_id;
  test("create a new thread", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({ text: "test text", delete_password: "delete me" })
      .end(function (err, res) {
        // thread_id=res.body._id;
        // console.log(res);
        thread_id = res.body._id;
        //console.log("thread id = ", thread_id);
        assert.equal(res.status, 200);
        done();
      });
  });
  test("view the 10 most recent threads with 3 replies each", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        assert.isArray(res.body);
        done();
      });
  });
  test("delete a thread with incorrect password", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        // console.log(res.body);
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: thread_id, delete_password: "wrong password" })
          .end(function (err, res) {
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
  });
  test("delete a thread with correct password", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({ text: "to be deleted", delete_password: "delete" })
      .end(function (err, res) {
        thread_id = res.body._id;
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({ thread_id: thread_id, delete_password: "delete" })
          .end(function (err, res) {
            assert.equal(res.text, "success");
            done();
          });
      });
  });
  test("report a thread", function (done) {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({ text: "random text", delete_password: "delete mel" })
      .end(function (err, res) {
        thread_id = res.body._id;
        chai
          .request(server)
          .put("/api/threads/test")
          .send({ thread_id: thread_id })
          .end(function (err, res) {
            assert.equal(res.text, "reported");
            done();
          });
      });
  });
  test("create a new reply", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "reply test",
            delete_password: "delete reply",
            thread_id: thread_id,
          })
          .end(function (err, res) {
            assert.equal(res.body.text, "reply test");
            done();
          });
      });
  });
  test("view a single thread with all replies", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        chai
          .request(server)
          .get("/api/replies/test")
          .query({ thread_id: thread_id })
          .end(function (err, res) {
            assert.isArray(res.body.replies);
            assert.equal(res.status, 200);
            done();
          });
      });
  });
  test("delete a reply with incorrect password", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "random text 145",
            delete_password: "delete",
            thread_id: thread_id,
          })
          .end(function (err, res) {
            reply_id = res.body._id;
            chai
              .request(server)
              .delete("/api/replies/test")
              .send({
                thread_id: thread_id,
                reply_id: reply_id,
                delete_password: "wrong",
              })
              .end(function (err, res) {
                assert.equal(res.text, "incorrect password");
                done();
              });
          });
      });
  });
  test("delete a reply with correct password", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "random text 146",
            delete_password: "delete",
            thread_id: thread_id,
          })
          .end(function (err, res) {
            reply_id = res.body._id;
            chai
              .request(server)
              .delete("/api/replies/test")
              .send({
                thread_id: thread_id,
                reply_id: reply_id,
                delete_password: "delete",
              })
              .end(function (err, res) {
                assert.equal(res.text, "success");
                done();
              });
          });
      });
  });
  test("report a reply", function (done) {
    chai
      .request(server)
      .get("/api/threads/test")
      .end(function (err, res) {
        thread_id = res.body[0]._id;
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            text: "random text 3",
            delete_password: "delete",
            thread_id: thread_id,
          })
          .end(function (err, res) {
            reply_id = res.body._id;
            chai
              .request(server)
              .put("/api/replies/test")
              .send({ thread_id: thread_id, reply_id: reply_id })
              .end(function (err, res) {
                assert.equal(res.text, "reported");
                done();
              });
          });
      });
  });
});
