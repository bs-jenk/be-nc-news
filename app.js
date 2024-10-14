const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const { getArticleById } = require("./controllers/articles.controllers");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
    response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

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
    response.status(500).send({ msg: "ERROR: internal server error" });
});

module.exports = app;
