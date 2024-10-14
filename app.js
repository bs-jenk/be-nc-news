const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const app = express();

app.get("/api/topics", getTopics);

app.all("*", (request, response, next) => {
    response.status(404).send({ msg: "ERROR: path not found" });
});

app.use((err, request, response, next) => {
    response.status(500).send({ msg: "ERROR: internal server error" });
});

module.exports = app;
