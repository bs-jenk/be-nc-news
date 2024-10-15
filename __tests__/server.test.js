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
                        expect(article).toHaveProperty("topic");
                        expect(article).toHaveProperty("created_at");
                        expect(article).toHaveProperty("votes");
                        expect(article).toHaveProperty("article_img_url");
                        expect(article).toHaveProperty("comment_count");
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
            return (
                request(app)
                    .get("/api/articles/3/comments")
                    //fix this
                    .expect((response) => {
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
                            expect(comment).toHaveProperty("author");
                            expect(comment).toHaveProperty("body");
                            expect(comment).toHaveProperty("article_id");
                        });
                    })
            );
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
    });
});
