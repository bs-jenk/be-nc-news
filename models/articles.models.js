const db = require("../db/connection");

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
    const validSortByColumns = [
        "article_id",
        "title",
        "topic",
        "author",
        "created_at",
        "votes",
        "article_img_url",
        "comment_count",
    ];
    const validOrderOptions = ["asc", "desc"];
    if (
        !validSortByColumns.includes(sort_by) ||
        !validOrderOptions.includes(order)
    ) {
        return Promise.reject({
            status: 400,
            msg: "ERROR: bad request - invalid query",
        });
    }

    let dbQueryString = `SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::int AS comment_count FROM articles 
    LEFT JOIN comments ON comments.article_id = articles.article_id`;
    let dbQueryValues = [];

    if (topic) {
        dbQueryString += " WHERE topic = $1";
        dbQueryValues.push(topic);
    }

    dbQueryString += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order.toUpperCase()};`;

    return db.query(dbQueryString, dbQueryValues).then((result) => {
        return result.rows;
    });
};

exports.selectArticleById = (article_id) => {
    return db
        .query(
            `SELECT articles.article_id, title, topic, articles.author, articles.body, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::int AS comment_count FROM articles
            FULL JOIN comments ON comments.article_id = articles.article_id
            WHERE articles.article_id = $1
            GROUP BY articles.article_id;`,
            [article_id]
        )
        .then((result) => {
            if (!result.rowCount) {
                return Promise.reject({
                    status: 404,
                    msg: "ERROR: article does not exist",
                });
            }
            return result.rows[0];
        });
};

exports.updateArticleById = (article_id, update) => {
    return db
        .query(
            `UPDATE articles
            SET votes = $1
            WHERE article_id = $2
            RETURNING *;`,
            [update.inc_votes, article_id]
        )
        .then((result) => {
            if (!result.rowCount) {
                return Promise.reject({
                    status: 404,
                    msg: "ERROR: article does not exist",
                });
            }
            return result.rows[0];
        });
};
