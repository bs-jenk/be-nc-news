const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const app = express();

app.get("/api/topics", getTopics);

app.all("*", (request, response, next) => {
    response.status(404).send({ msg: "ERROR: path not found" });
});

module.exports = app;
