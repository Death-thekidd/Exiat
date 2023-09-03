import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose, { ConnectOptions } from "mongoose";
import passport from "passport";
import bluebird from "bluebird";
import winston from "winston";
import { SESSION_SECRET } from "./util/secrets";
import { User, UserDocument, UserType } from "./models/user.model";
import SequelizeStore from "connect-session-sequelize";

// Controllers (route handlers)
import * as userController from "./controllers/user.controller";
import * as leaveRequestController from "./controllers/leaveRequest.controller";
import * as currencyController from "./controllers/currency.controller";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import { type } from "os";
import { MongoClientOptions } from "mongodb";

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

// Connect to MongoDB
// const mongoUrl = MONGODB_URI;
// mongoose.Promise = bluebird;

// mongoose
// 	.connect(mongoUrl, {
// 		useNewUrlParser: true,
// 		useCreateIndex: true,
// 		useUnifiedTopology: true,
// 	} as ConnectOptions)
// 	.then(() => {
// 		/** ready to use. The `mongoose.connect()` promise resolves to undefined. */
// 		console.log("Connected to MongoDB");
// 		// userAdd();
// 		console.log(mongoUrl);
// 	})
// 	.catch((err) => {
// 		console.log(
// 			`MongoDB connection error. Please make sure MongoDB is running. ${err}`
// 		);
// 		// process.exit();
// 	});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req: Request, res: Response, next: NextFunction) => {
	res.locals.user = req.user;
	next();
});

app.use(
	express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

const logger = winston.createLogger({
	transports: [
		new winston.transports.File({ filename: "error.log", level: "error" }),
	],
});

// mongoose
// 	.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
// 	.then(() => {
// 		console.log("Connected to MongoDB");
// 		userAdd() ;
// 		console.log(mongoUrl);
// 	})
// 	.catch((error) => {
// 		console.error("Error connecting to MongoDB:", error);
// 	});

// async function userAdd() {
// 	const user = new User({
// 		email: "ohiemidivine8@gmail.com",
// 		password: "typescriptSolos",
// 		name: "Divine Samuel",
// 		userType: UserType.Student,
// 	});

// 	User.findOne(
// 		{ email: user.email },
// 		async (err: any, existingUser: UserDocument) => {
// 			if (!existingUser) {
// 				await user.save();
// 			}
// 		}
// 	);
// }

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
	logger.error(err.message);
	res.status(err.status || 500).json({ error: "Something went wrong" });
});

export default app;
