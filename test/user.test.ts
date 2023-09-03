import request from "supertest";
import app from "../src/app";
import { expect } from "chai";

describe("GET /", () => {
	it("should return 200", (done) => {
		request(app).get("/").expect(200, done);
	});
});

// describe("POST /signup", () => {
// 	it("should create a new user(student)", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			name: "Divine Attah-Ohiemi",
// 			username: "Deaththekidd",
// 			userType: "Student",
// 			email: "ohiemidivine7@gmail.com",
// 			guardianEmail: "ohiemidivine8@gmail.com",
// 			guardianPhone: "08107146846",
// 			guardianName: "Popsy",
// 			password: "typescriptsolos",
// 			confirmPassword: "typescriptsolos",
// 		};

// 		const response = await request(app).post("/signup").send(requestBody);

// 		expect(response.status).to.equal(201);
// 		expect(response.body).to.have.property(
// 			"message",
// 			"User registered successfully."
// 		);
// 	}, 60000);

// 	it("should create a new user(Staff)", async () => {
// 		// Define a mock request body with valid data
// 		const requestBody = {
// 			name: "Mary Attah-Ohiemi",
// 			username: "Paladin",
// 			userType: "Staff",
// 			email: "ohiemidivine8@gmail.com",
// 			staffType: "Dean of Student",
// 			password: "typescriptsolos",
// 			confirmPassword: "typescriptsolos",
// 		};

// 		const response = await request(app).post("/signup").send(requestBody);

// 		expect(response.status).to.equal(201);
// 		expect(response.body).to.have.property(
// 			"message",
// 			"User registered successfully."
// 		);
// 	}, 60000);

// 	it("should return an error for duplicate email", async () => {
// 		const requestBody = {
// 			name: "Divine Attah-Ohiemi",
// 			username: "Deaththekidd",
// 			userType: "Student",
// 			email: "ohiemidivine7@gmail.com", // An email that already exists on the database
// 			password: "typescriptsolos",
// 			confirmPassword: "typescriptsolos",
// 		};

// 		const response = await request(app).post("/signup").send(requestBody);

// 		expect(response.status).to.equal(409);
// 		expect(response.body).to.have.property(
// 			"error",
// 			"Account with that email address already exists."
// 		);
// 	}, 10000);
// });

// describe("POST /login", () => {
// 	it("should return a success message and user data on successful login", (done) => {
// 		request(app)
// 			.post("/login")
// 			.send({ email: "ohiemidivine7@gmail.com", password: "typescriptsolos" }) // Replace with valid test data
// 			.expect(200) // Expecting a 200 status code for a successful login
// 			.end((err, res) => {
// 				if (err) return done(err);

// 				// Assertions for the response body
// 				expect(res.body).to.have.property(
// 					"message",
// 					"Success! You are logged in."
// 				);
// 				expect(res.body).to.have.property("user"); // Assuming the user object is returned

// 				done();
// 			});
// 	});

// 	it("should return a success message and user data on successful login", (done) => {
// 		request(app)
// 			.post("/login")
// 			.send({ email: "ohiemidivine8@gmail.com", password: "typescriptsolos" }) // Replace with valid test data
// 			.expect(200) // Expecting a 200 status code for a successful login
// 			.end((err, res) => {
// 				if (err) return done(err);

// 				// Assertions for the response body
// 				expect(res.body).to.have.property(
// 					"message",
// 					"Success! You are logged in."
// 				);
// 				expect(res.body).to.have.property("user"); // Assuming the user object is returned

// 				done();
// 			});
// 	});

// 	it("should return a 401 status code on authentication failure", (done) => {
// 		request(app)
// 			.post("/login")
// 			.send({ email: "invalid@example.com", password: "invalid" }) // Replace with invalid data
// 			.expect(401, done); // Expecting a 401 status code for authentication failure
// 	});

// 	it("should return a 400 status code on validation failure", (done) => {
// 		request(app)
// 			.post("/login")
// 			.send({ email: "invalid-email", password: "" }) // Invalid email and blank password
// 			.expect(400, done); // Expecting a 400 status code for validation failure
// 	});

// 	// it("should return a 500 status code on internal server error", (done) => {
// 	// 	// You can create a scenario where the server encounters an error, and your passport.authenticate callback returns an error
// 	// 	// Simulate that scenario here
// 	// 	request(app)
// 	// 		.post("/login")
// 	// 		.send({ email: "error@example.com", password: "error" }) // Replace with data that triggers an internal error
// 	// 		.expect(500, done); // Expecting a 500 status code for internal server error
// 	// });
// });
