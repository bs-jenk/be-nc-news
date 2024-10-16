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
        test("200 - sorts the data by date in descending order", () => {
            return request(app)
                .get("/api/articles")
                .expect(200)
                .then((response) => {
                    expect(response.body.articles).toBeSortedBy("created_at", {
                        descending: true,
                    });
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
        test("200 - inserts and returns a new comment to the client even when unnecessary properties are provided", () => {
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
    });
});
