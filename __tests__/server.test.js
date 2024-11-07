const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const {
    articleData,
    commentData,
    topicData,
    userData,
} = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");

beforeEach(() => seed({ articleData, commentData, topicData, userData }));
afterAll(() => db.end());

describe("* ALL incorrect endpoints", () => {
    test("404 - sends an error message to the client when a request is made to a path that does not exist", () => {
        return request(app)
            .get("/api/notvalid")
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe("ERROR: path not found");
            });
    });
});

describe("API endpoints", () => {
    describe("GET: /api", () => {
        test("200 - sends an object which documents all the available endpoints the client can use", () => {
            return request(app)
                .get("/api")
                .expect(200)
                .then((response) => {
                    expect(response.body.endpoints).toEqual(endpoints);
                });
        });
    });
    describe("GET: /api/topics ", () => {
        test("200 - sends an array of all the topics to the client", () => {
            return request(app)
                .get("/api/topics")
                .expect(200)
                .then((response) => {
                    expect(response.body.topics.length).toBe(3);
                    response.body.topics.forEach((topic) => {
                        expect(topic).toHaveProperty("slug");
                        expect(topic).toHaveProperty("description");
                    });
                });
        });
    });
    describe("GET: /api/articles/:article_id", () => {
        test("200 - sends a single article to the client", () => {
            return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then((response) => {
                    expect(response.body.article).toMatchObject({
                        title: "Living in the shadow of a great man",
                        topic: "mitch",
                        author: "butter_bridge",
                        body: "I find this existence challenging",
                        votes: 100,
                        article_img_url:
                            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                    });
                    expect(response.body.article).toHaveProperty("article_id");
                    expect(response.body.article).toHaveProperty("created_at");
                });
        });
        test("404 - sends an appropriate error message to the client when given a valid but non-existent id", () => {
            return request(app)
                .get("/api/articles/976")
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: article does not exist"
                    );
                });
        });
        test("400 - sends an appropriate error message to the client when given an invalid id", () => {
            return request(app)
                .get("/api/articles/not-an-article-id")
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
        test("200 - sends a comment count as part of the article response object which is a total of all the comments associated with the selected article", () => {
            return request(app)
                .get("/api/articles/1")
                .expect(200)
                .then((response) => {
                    expect(response.body.article).toHaveProperty(
                        "comment_count"
                    );
                    expect(response.body.article.comment_count).toBe(11);
                });
        });
    });
    describe("GET: /api/articles", () => {
        test("200 - sends an array of all the articles to the client", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    expect(response.body.articles.length).toBe(13);
                    response.body.articles.forEach((article) => {
                        expect(article).toHaveProperty(
                            "author",
                            expect.any(String)
                        );
                        expect(article).toHaveProperty(
                            "title",
                            expect.any(String)
                        );
                        expect(article).toHaveProperty(
                            "article_id",
                            expect.any(Number)
                        );
                        expect(article).toHaveProperty(
                            "topic",
                            expect.any(String)
                        );
                        expect(article).toHaveProperty(
                            "created_at",
                            expect.any(String)
                        );
                        expect(article).toHaveProperty(
                            "votes",
                            expect.any(Number)
                        );
                        expect(article).toHaveProperty(
                            "article_img_url",
                            expect.any(String)
                        );
                        expect(article).toHaveProperty(
                            "comment_count",
                            expect.any(Number)
                        );
                        expect(article).not.toHaveProperty("body");
                    });
                });
        });
        test("200 - sorts the data by date in descending order by default", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("200 - sorts the data by any valid article column when specified as a query", () => {
            const columns = [
                "article_id",
                "title",
                "topic",
                "author",
                "created_at",
                "votes",
                "article_img_url",
                "comment_count",
            ];
            return request(app)
                .get(`/api/articles?sort_by=${columns[1]}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy(columns[1], {
                        descending: true,
                    });
                });
        });
        test("200 - sorts the data in either ascending or descending order when specified as a query", () => {
            const order = ["asc", "desc"];
            return request(app)
                .get(`/api/articles?order=${order[0]}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy("created_at");
                });
        });
        test("200 - sorts the data by article column and in ascending or descending order when provided with both queries", () => {
            const columns = [
                "article_id",
                "title",
                "topic",
                "author",
                "created_at",
                "votes",
                "article_img_url",
                "comment_count",
            ];
            const order = ["asc", "desc"];
            return request(app)
                .get(`/api/articles?sort_by=${columns[7]}&order=${order[0]}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy(columns[7]);
                });
        });
        test("200 - ignores the query when the client uses a query term that does not exist and sends the data in the default order", () => {
            const nonExistentQueryTerm = "search";
            return request(app)
                .get(`/api/articles?${nonExistentQueryTerm}=votes`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy("created_at", {
                        descending: true,
                    });
                });
        });
        test("400 - sends an appropriate error message when the client uses an invalid query string", () => {
            const invalidQueryString = "name";
            return request(app)
                .get(`/api/articles?sort_by=${invalidQueryString}`)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid query"
                    );
                });
        });
        test("200 - filters the data by topic when a valid topic is provided as a query", () => {
            const topic = "cats";
            return request(app)
                .get(`/api/articles?topic=${topic}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toHaveLength(1);
                    response.body.articles.forEach((article) => {
                        expect(article.topic).toBe(topic);
                    });
                });
        });
        test("200 - sends an empty array to the client when given a query with a valid topic with no associated articles", () => {
            const topic = "paper";
            return request(app)
                .get(`/api/articles?topic=${topic}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeArray();
                    expect(response.body.articles).toHaveLength(0);
                });
        });
        test("404 - sends an appropriate error message when the client tries to filter articles with a query using a topic that doesn't exist", () => {
            const nonExistentTopic = "food";
            return request(app)
                .get(`/api/articles?topic=${nonExistentTopic}`)
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: topic does not exist"
                    );
                });
        });
    });
    describe("GET: /api/articles/:article_id/comments", () => {
        test("200 - sends an array of comments for the selected article to the client", () => {
            return request(app)
                .get("/api/articles/3/comments")
                .expect(200)
                .then((response) => {
                    expect(response.body.comments.length).toBe(2);
                    response.body.comments.forEach((comment) => {
                        expect(comment).toHaveProperty(
                            "comment_id",
                            expect.any(Number)
                        );
                        expect(comment).toHaveProperty(
                            "votes",
                            expect.any(Number)
                        );
                        expect(comment).toHaveProperty(
                            "created_at",
                            expect.any(String)
                        );
                        expect(comment).toHaveProperty(
                            "author",
                            expect.any(String)
                        );
                        expect(comment).toHaveProperty(
                            "body",
                            expect.any(String)
                        );
                        expect(comment).toHaveProperty(
                            "article_id",
                            expect.any(Number)
                        );
                    });
                });
        });
        test("200 - sorts the comments by date and time with the most recent first", () => {
            return request(app)
                .get("/api/articles/1/comments")
                .expect(200)
                .then((response) => {
                    expect(response.body.comments).toBeSortedBy("created_at", {
                        descending: true
                    });
                });
        });
        test("400 - sends an appropriate error message to the client when given an invalid article id", () => {
            return request(app)
                .get("/api/articles/invalid-id/comments")
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
        test("404 - sends an appropriate error message to the client when given an id that is valid but does not exist", () => {
            return request(app)
                .get("/api/articles/423/comments")
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: article does not exist"
                    );
                });
        });
        test("200 - sends an empty array to the client when given an article id that exists but has no comments", () => {
            return request(app)
                .get("/api/articles/7/comments")
                .expect(200)
                .then((response) => {
                    expect(response.body.comments).toBeArray();
                    expect(response.body.comments).toHaveLength(0);
                });
        });
    });
    describe("POST: /api/articles/:article_id/comments", () => {
        test("200 - inserts a new comment associated with a given article id into the database and sends the new comment back to the client", () => {
            const newComment = {
                username: "butter_bridge",
                body: "Cats are dangerous.",
            };
            return request(app)
                .post("/api/articles/5/comments")
                .send(newComment)
                .expect(201)
                .then((response) => {
                    expect(response.body.newComment).toMatchObject({
                        author: "butter_bridge",
                        body: "Cats are dangerous.",
                        article_id: 5,
                        votes: 0,
                    });
                    expect(response.body.newComment).toHaveProperty(
                        "comment_id",
                        expect.any(Number)
                    );
                    expect(response.body.newComment).toHaveProperty(
                        "created_at",
                        expect.any(String)
                    );
                });
        });
        test("200 - inserts the new comment and sends it back to the client along with an informative message when unnecessary properties are provided", () => {
            const newComment = {
                username: "icellusedkars",
                body: "I like loud typing.",
                favouriteColour: "green",
            };
            return request(app)
                .post("/api/articles/4/comments")
                .send(newComment)
                .expect(201)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "NOTE: 1 or more unnecessary properties were passed in your request"
                    );
                    expect(response.body.newComment).toMatchObject({
                        author: "icellusedkars",
                        body: "I like loud typing.",
                        article_id: 4,
                        votes: 0,
                    });
                    expect(response.body.newComment).toHaveProperty(
                        "comment_id",
                        expect.any(Number)
                    );
                    expect(response.body.newComment).toHaveProperty(
                        "created_at",
                        expect.any(String)
                    );
                });
        });
        test("400 - sends an appropriate error message when the client tries to post a comment using an invalid article id", () => {
            const newComment = {
                username: "icellusedkars",
                body: "My favourite article!",
            };
            return request(app)
                .post("/api/articles/invalid-id/comments")
                .send(newComment)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
        test("404 - sends an appropriate error message when the client tries to post a comment using an article id that does not exist", () => {
            const newComment = {
                username: "butter_bridge",
                body: "I love this article.",
            };
            return request(app)
                .post("/api/articles/235/comments")
                .send(newComment)
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: article does not exist"
                    );
                });
        });
        test("400 - sends an appropriate error message when the client tries to post a comment with missing input field(s)", () => {
            const newComment = {};
            return request(app)
                .post("/api/articles/2/comments")
                .send(newComment)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - missing input field(s)"
                    );
                });
        });
        test("404 - sends an appropriate error message when the client tries to post a comment with a username that doesn't exist in the database", () => {
            const newComment = {
                username: "testUser123",
                body: "I love this article.",
            };
            return request(app)
                .post("/api/articles/6/comments")
                .send(newComment)
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: user does not exist"
                    );
                });
        });
    });
    describe("PATCH: /api/articles/:article_id", () => {
        test("200 - updates the votes property on an article and sends the updated article to the client", () => {
            const update = { inc_votes: 1 };
            return request(app)
                .patch("/api/articles/3")
                .send(update)
                .expect(200)
                .then((response) => {
                    expect(response.body.updatedArticle.votes).toBe(1);
                    expect(response.body.updatedArticle.article_id).toBe(3);
                    expect(response.body.updatedArticle.title).toBe(
                        "Eight pug gifs that remind me of mitch"
                    );
                    expect(response.body.updatedArticle.author).toBe(
                        "icellusedkars"
                    );
                    expect(response.body.updatedArticle.topic).toBe("mitch");
                    expect(response.body.updatedArticle.body).toBe("some gifs");
                    expect(response.body.updatedArticle).toHaveProperty(
                        "article_img_url",
                        expect.any(String)
                    );
                    expect(response.body.updatedArticle).toHaveProperty(
                        "created_at",
                        expect.any(String)
                    );
                });
        });
        test("200 - updates the votes property and sends the updated article back along with an informative message when unnecessary properties are provided", () => {
            const update = { inc_votes: 4, extra_property: "example" };
            return request(app)
                .patch("/api/articles/5")
                .send(update)
                .expect(200)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "NOTE: 1 or more unnecessary properties were passed in your request"
                    );
                    expect(response.body.updatedArticle.votes).toBe(4);
                    expect(response.body.updatedArticle.article_id).toBe(5);
                    expect(response.body.updatedArticle.title).toBe(
                        "UNCOVERED: catspiracy to bring down democracy"
                    );
                    expect(response.body.updatedArticle.author).toBe(
                        "rogersop"
                    );
                    expect(response.body.updatedArticle.topic).toBe("cats");
                    expect(response.body.updatedArticle).toHaveProperty(
                        "body",
                        expect.any(String)
                    );
                    expect(response.body.updatedArticle).toHaveProperty(
                        "article_img_url",
                        expect.any(String)
                    );
                    expect(response.body.updatedArticle).toHaveProperty(
                        "created_at",
                        expect.any(String)
                    );
                });
        });
        test("400 - sends an appropriate error message when the client tries to update an article using an invalid article id", () => {
            const update = { inc_votes: 1 };
            return request(app)
                .patch("/api/articles/invalid-id")
                .send(update)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
        test("404 - sends an appropriate error message when the client tries to update an article using an article id that does not exist", () => {
            const update = { inc_votes: 1 };
            return request(app)
                .patch("/api/articles/657")
                .send(update)
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: article does not exist"
                    );
                });
        });
        test("400 - sends an appropriate error message when the client tries to update an article with a missing field in the request body", () => {
            const update = {};
            return request(app)
                .patch("/api/articles/3")
                .send(update)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - missing input field(s)"
                    );
                });
        });
        test("400 - sends an appropriate error message when the client tries to update an article with invalid data in the required field", () => {
            const update = { inc_votes: "seven" };
            return request(app)
                .patch("/api/articles/4")
                .send(update)
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
    });
    describe("DELETE: /api/comments/:comment_id", () => {
        test("204 - deletes a comment when provided with a comment id", () => {
            return request(app).delete("/api/comments/7").expect(204);
        });
        test("400 - sends an appropriate error message when the client tries to delete a comment using an invalid comment id", () => {
            return request(app)
                .delete("/api/comments/invalid-id")
                .expect(400)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: bad request - invalid input"
                    );
                });
        });
        test("404 - sends an appropriate error message when the client tries to delete a comment using a comment id that does not exist", () => {
            return request(app)
                .delete("/api/comments/752")
                .expect(404)
                .then((response) => {
                    expect(response.body.msg).toBe(
                        "ERROR: comment does not exist"
                    );
                });
        });
    });
    describe("GET: /api/users", () => {
        test("200 - sends an array of all users to the client", () => {
            return request(app)
                .get("/api/users")
                .expect(200)
                .then((response) => {
                    expect(response.body.users).toHaveLength(4);
                    response.body.users.forEach((user) => {
                        expect(user).toHaveProperty("username");
                        expect(user).toHaveProperty("name");
                        expect(user).toHaveProperty("avatar_url");
                    });
                });
        });
    });
});
