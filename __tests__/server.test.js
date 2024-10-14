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
        test("200 - sends an array of topics to the client", () => {
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
                    });
                });
        });
    });
});
