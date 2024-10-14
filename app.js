const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
    response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.all("*", (request, response, next) => {
    response.status(404).send({ msg: "ERROR: path not found" });
});

app.use((err, request, response, next) => {
    response.status(500).send({ msg: "ERROR: internal server error" });
});

module.exports = app;
