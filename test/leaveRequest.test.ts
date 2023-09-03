import request from "supertest";
import app from "../src/app";
import { expect } from "chai";

// describe("GET /", () => {
// 	it("should return 200", (done) => {
// 		request(app).get("/").expect(200, done);
// 	});
// });

// describe("POST /submit-request", () => {
// 	it("should create a new leave request", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			reason: "My family requested me to attend my Father's burial",
// 			departureDate: new Date(2023, 9, 27),
// 			returnDate: new Date(2023, 10, 5),
// 			id: "9861d252-59a6-4c2a-a7d7-ada03ec35aab",
// 		};

// 		const response = await request(app)
// 			.post("/submit-request")
// 			.send(requestBody);

// 		expect(response.status).to.equal(201);
// 		expect(response.body).to.have.property(
// 			"message",
// 			"Leave Request submitted successfully."
// 		);
// 	}, 60000);
// });

// describe("POST /approve-leave-request", () => {
// 	it("should approve leave request", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			requestID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 			StaffID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 		};

// 		const response = await request(app)
// 			.post("/approve-leave-request")
// 			.send(requestBody);

// 		expect(response.status).to.equal(500);
// 		expect(response.body).to.have.property("error", "Leave Request not found.");
// 	}, 60000);
// });

// describe("POST /reject-leave-request", () => {
// 	it("should reject leave request", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			requestID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 			StaffID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 		};

// 		const response = await request(app)
// 			.post("/reject-leave-request")
// 			.send(requestBody);

// 		expect(response.status).to.equal(500);
// 		expect(response.body).to.have.property("error", "Leave Request not found.");
// 	}, 60000);
// });

// describe("POST /check-out", () => {
// 	it("should check-out student to initialize their leave request", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			requestID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 			StaffID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 		};

// 		const response = await request(app)
// 			.post("/reject-leave-request")
// 			.send(requestBody);

// 		expect(response.status).to.equal(500);
// 		expect(response.body).to.have.property("error", "Leave Request not found.");
// 	}, 60000);
// });

// describe("POST /check-in", () => {
// 	it("should check-in student to complete their leave request", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			requestID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 			StaffID: "a11c50f0-9f94-4e30-b886-06e87948d1e7",
// 		};

// 		const response = await request(app)
// 			.post("/reject-leave-request")
// 			.send(requestBody);

// 		expect(response.status).to.equal(500);
// 		expect(response.body).to.have.property("error", "Leave Request not found.");
// 	}, 60000);
// });
