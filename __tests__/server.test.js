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

beforeEach(() => seed({ articleData, commentData, topicData, userData }));
afterAll(() => db.end());

describe("API endpoints", () => {
    describe("GET: /api/topics ", () => {
        test("200 - sends an array of topics to the client", () => {
            return request(app)
                .get("/api/topics")
                .expect(200)
                .then((response) => {
                    response.body.topics.forEach((topic) => {
                        expect(typeof topic.slug).toBe("string");
                        expect(typeof topic.description).toBe("string");
                    });
                });
        });
    });
});
