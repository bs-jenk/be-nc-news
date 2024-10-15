const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id) => {
    return db
        .query("SELECT * FROM comments WHERE article_id = $1;", [article_id])
        .then((result) => {
            if (!result.rowCount) {
                return Promise.reject({
                    status: 404,
                    msg: "ERROR: article does not exist",
                });
            }
            return result.rows;
        });
};
