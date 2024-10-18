const db = require("./db/connection");

exports.checkIfTopicExists = (topic) => {
    return db
        .query("SELECT * FROM topics WHERE slug = $1;", [topic])
        .then((result) => {
            if (!result.rowCount) {
                return Promise.reject({
                    status: 404,
                    msg: "ERROR: topic does not exist",
                });
            }
            return true;
        });
};
