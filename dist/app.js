"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression")); // compresses requests
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const lusca_1 = __importDefault(require("lusca"));
const express_flash_1 = __importDefault(require("express-flash"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const winston_1 = __importDefault(require("winston"));
const secrets_1 = require("./util/secrets");
const connect_session_sequelize_1 = __importDefault(require("connect-session-sequelize"));
// Controllers (route handlers)
const userController = __importStar(require("./controllers/user.controller"));
const leaveRequestController = __importStar(require("./controllers/leaveRequest.controller"));
const currencyController = __importStar(require("./controllers/currency.controller"));
// API keys and Passport configuration
const passportConfig = __importStar(require("./config/passport"));
const sequelize_1 = __importDefault(require("./sequelize"));
const user_model_1 = require("./models/user.model");
const staff_model_1 = require("./models/staff.model");
const student_model_1 = require("./models/student.model");
const leaveRequest_model_1 = require("./models/leaveRequest.model");
// Create Express server
const app = express_1.default();
app.use(cors_1.default());
// Initialize models
user_model_1.init();
staff_model_1.init();
student_model_1.init();
leaveRequest_model_1.init();
// Sync the database
sequelize_1.default
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
app.set("port", process.env.PORT || 3001);
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_session_1.default({
    resave: true,
    saveUninitialized: true,
    secret: secrets_1.SESSION_SECRET,
    store: new (connect_session_sequelize_1.default(express_session_1.default.Store))({
        db: sequelize_1.default,
        tableName: "sessions", // Table name to store sessions in your database
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_flash_1.default());
app.use(lusca_1.default.xframe("SAMEORIGIN"));
app.use(lusca_1.default.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
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
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Exiat application." });
});
app.post("/login", userController.postLogin);
app.post("/forgot", userController.postForgot);
app.post("/signup", userController.postSignup);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.post("/submit-request", leaveRequestController.submitLeaveRequest);
app.post("/approve-leave-request", leaveRequestController.approveLeaveRequest);
app.post("/reject-leave-request", leaveRequestController.rejectLeaveRequest);
app.post("/check-in", leaveRequestController.checkInStudent);
app.post("/check-out", leaveRequestController.checkOutStudent);
app.post("/initialize-payment", currencyController.initializePayment);
app.post("/verify-transaction", currencyController.verifyPayment);
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(err.status || 500).json({ error: "Something went wrong" });
});
exports.default = app;
//# sourceMappingURL=app.js.map