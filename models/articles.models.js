const db = require("../db/connection");

exports.selectArticles = (sort_by = "created_at", order = "desc") => {
    return db
        .query(
            `SELECT articles.article_id, title, articles.author, topic, articles.created_at, articles.votes, article_img_url, COUNT(comment_id)::int AS comment_count FROM articles
            LEFT JOIN comments ON comments.article_id = articles.article_id
            GROUP BY articles.article_id
            ORDER BY articles.${sort_by} ${order.toUpperCase()};`
        )
        .then((result) => {
            return result.rows;
        });
};

exports.selectArticleById = (article_id) => {
    return db
        .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
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
