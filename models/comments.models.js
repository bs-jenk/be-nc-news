const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
    return db
        .query("SELECT * FROM comments WHERE article_id = $1;", [article_id])
        .then((result) => {
            return result.rows;
        });
};

exports.insertCommentByArticleId = (article_id, comment) => {
    return db
        .query(
            `INSERT INTO comments
            (body, author, article_id)
            VALUES
            ($1, $2, $3)
            RETURNING *;`,
            [comment.body, comment.username, article_id]
        )
        .then((result) => {
            return result.rows[0];
        });
};

exports.removeCommentById = (comment_id) => {
    return db
        .query("DELETE FROM comments WHERE comment_id = $1;", [comment_id])
        .then((result) => {
            if (!result.rowCount) {
                return Promise.reject({
                    status: 404,
                    msg: "ERROR: comment does not exist",
                });
            }
        });
};
