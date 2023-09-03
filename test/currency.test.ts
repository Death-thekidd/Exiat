import request from "supertest";
import app from "../src/app";
import { expect } from "chai";

describe("GET /", () => {
	it("should return 200", (done) => {
		request(app).get("/").expect(200, done);
	});
});

describe("POST /initialize-payment", () => {
	it("should return a response url for payment gateway", async () => {
		// Define a mock request body with valid data
		const requestBody = {
			email: "ohiemidivine7@gmail.com",
			amount: 10000,
		};

		const response = await request(app)
			.post("/initialize-payment")
			.send(requestBody);

		expect(response.status).to.equal(200);
		expect(response.body).to.have.property(
			"message",
			"Authorization URL created"
		);
	}, 60000);
});

// describe("POST /verify-transaction", () => {
// 	it("should return a response url for payment gateway", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			email: "ohiemidivine7@gmail.com",
// 			amount: 10000,
// 		};

// 		const response = await request(app)
// 			.post("/verify-transaction")
// 			.send(requestBody);

// 		expect(response.status).to.equal(200);
// 		expect(response).to.have.property("message", "Verification successful");
// 	}, 60000);
// });
