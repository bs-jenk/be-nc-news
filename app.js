const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controllers");
const {
    getArticles,
    getArticleById,
    patchArticleById,
} = require("./controllers/articles.controllers");
const {
    getCommentsByArticleId,
    postCommentsByArticleId,
    deleteCommentById,
} = require("./controllers/comments.controllers");

app.use(express.json());

app.get("/api", (request, response) => {
    response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentsByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("*", (request, response, next) => {
    response.status(404).send({ msg: "ERROR: path not found" });
});

app.use((err, request, response, next) => {
    if (err.status && err.msg) {
        response.status(err.status).send({ msg: err.msg });
    }
    next(err);
});

app.use((err, request, response, next) => {
    if (err.code === "22P02") {
        response
            .status(400)
            .send({ msg: "ERROR: bad request - invalid input" });
    }
    next(err);
});

app.use((err, request, response, next) => {
    if (err.code === "23503") {
        if (err.constraint.includes("article")) {
            response.status(404).send({ msg: "ERROR: article does not exist" });
        } else if (err.constraint.includes("author")) {
            response.status(404).send({ msg: "ERROR: user does not exist" });
        }
    }
    next(err);
});

app.use((err, request, response, next) => {
    if (err.code === "23502") {
        response
            .status(400)
            .send({ msg: "ERROR: bad request - missing input field(s)" });
    }
    next(err);
});

app.use((err, request, response, next) => {
    response.status(500).send({ msg: "ERROR: internal server error" });
});

module.exports = app;
