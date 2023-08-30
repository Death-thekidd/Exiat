import request from "supertest";
import app from "../src/app";

describe("GET /random-url", () => {
	it("should return 200", (done) => {
		request(app).get("/").expect(200, done);
	});
});
