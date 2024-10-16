const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");
const { getTopics } = require("./controllers/topics.controllers");
const {
    getArticles,
    getArticleById,
} = require("./controllers/articles.controllers");
const {
    getCommentsByArticleId,
    postCommentsByArticleId,
} = require("./controllers/comments.controllers");

app.use(express.json());

app.get("/api", (request, response) => {
    response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentsByArticleId);

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
        response.status(404).send({ msg: "ERROR: article does not exist" });
    }
});

app.use((err, request, response, next) => {
    response.status(500).send({ msg: "ERROR: internal server error" });
});

module.exports = app;
