import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import winston from "winston";
import { SESSION_SECRET } from "./util/secrets";
import SequelizeStore from "connect-session-sequelize";

// Controllers (route handlers)
import * as userController from "./controllers/user.controller";
import * as leaveRequestController from "./controllers/leaveRequest.controller";
import * as currencyController from "./controllers/currency.controller";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

import sequelize from "./sequelize";
import { init as initUserModel } from "./models/user.model";
import { init as initStaffModel } from "./models/staff.model";
import { init as initStudentModel } from "./models/student.model";
import { init as initLeaveRequestModel } from "./models/leaveRequest.model";

// Create Express server
const app = express();

app.use(cors());

// Initialize models
initUserModel();
initStaffModel();
initStudentModel();
initLeaveRequestModel();

// Sync the database
sequelize
	.authenticate()
	.then(() => {
		console.log("Connected to the database");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});

// Express configuration
app.set("port", process.env.PORT || 3001);
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: SESSION_SECRET,
		store: new (SequelizeStore(session.Store))({
			db: sequelize, // Use your Sequelize instance
			tableName: "sessions", // Table name to store sessions in your database
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());

const logger = winston.createLogger({
	transports: [
		new winston.transports.File({ filename: "error.log", level: "error" }),
	],
});

/**
 * Primary app routes.
 */
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "Welcome to Exiat application." });
});
app.post("/login", userController.postLogin);
app.post("/forgot", userController.postForgot);
app.post("/signup", userController.postSignup);
app.post(
	"/account/profile",
	passportConfig.isAuthenticated,
	userController.postUpdateProfile
);
app.post(
	"/account/password",
	passportConfig.isAuthenticated,
	userController.postUpdatePassword
);
app.post(
	"/account/delete",
	passportConfig.isAuthenticated,
	userController.postDeleteAccount
);

app.post("/submit-request", leaveRequestController.submitLeaveRequest);
app.post("/approve-leave-request", leaveRequestController.approveLeaveRequest);
app.post("/reject-leave-request", leaveRequestController.rejectLeaveRequest);
app.post("/check-in", leaveRequestController.checkInStudent);
app.post("/check-out", leaveRequestController.checkOutStudent);

app.post("/initialize-payment", currencyController.initializePayment);
app.post("/verify-transaction", currencyController.verifyPayment);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	if (!res.headersSent) {
		logger.error(err.message);
		res.status(err.status || 500).json({ error: err.message });
	}
});

export default app;
