const {
    selectCommentsByArticleId,
    insertCommentsByArticleId,
} = require("../models/comments.models");
const { selectArticleById } = require("../models/articles.models");

exports.getCommentsByArticleId = (request, response, next) => {
    const article_id = request.params.article_id;
    const promises = [
        selectCommentsByArticleId(article_id),
        selectArticleById(article_id),
    ];
    Promise.all(promises)
        .then((results) => {
            const comments = results[0];
            response.status(200).send({ comments });
        })
        .catch((err) => {
            next(err);
        });
};

exports.postCommentsByArticleId = (request, response, next) => {
    const article_id = request.params.article_id;
    const comment = request.body;
    insertCommentsByArticleId(article_id, comment)
        .then((newComment) => {
            if (Object.keys(comment).length > 2) {
                const msg =
                    "NOTE: 1 or more unnecessary properties were passed in your request";
                response.status(201).send({ msg, newComment });
            } else {
                response.status(201).send({ newComment });
            }
        })
        .catch((err) => {
            next(err);
        });
};
