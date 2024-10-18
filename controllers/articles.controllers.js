const {
    selectArticles,
    selectArticleById,
    updateArticleById,
} = require("../models/articles.models");
const { checkIfTopicExists } = require("../util-functions");

exports.getArticles = (request, response, next) => {
    const sort_by = request.query.sort_by;
    const order = request.query.order;
    const topic = request.query.topic;

    const promises = [selectArticles(sort_by, order, topic)];

    if (topic) {
        promises.push(checkIfTopicExists(topic));
    }

    Promise.all(promises)
        .then((results) => {
            const articles = results[0];
            response.status(200).send({ articles });
        })
        .catch((err) => {
            next(err);
        });
};

exports.getArticleById = (request, response, next) => {
    const article_id = request.params.article_id;
    selectArticleById(article_id)
        .then((article) => {
            response.status(200).send({ article });
        })
        .catch((err) => {
            next(err);
        });
};

exports.patchArticleById = (request, response, next) => {
    const article_id = request.params.article_id;
    const update = request.body;
    updateArticleById(article_id, update)
        .then((updatedArticle) => {
            if (Object.keys(update).length > 1) {
                const msg =
                    "NOTE: 1 or more unnecessary properties were passed in your request";
                response.status(200).send({ msg, updatedArticle });
            } else {
                response.status(200).send({ updatedArticle });
            }
        })
        .catch((err) => {
            next(err);
        });
};
