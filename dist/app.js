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
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const winston_1 = __importDefault(require("winston"));
const secrets_1 = require("./util/secrets");
const connect_session_sequelize_1 = __importDefault(require("connect-session-sequelize"));
// Controllers (route handlers)
const userController = __importStar(require("./controllers/user.controller"));
const leaveRequestController = __importStar(require("./controllers/leaveRequest.controller"));
const payStackController = __importStar(require("./controllers/payStack.controller"));
const walletController = __importStar(require("./controllers/wallet.controller"));
const walletTransactionController = __importStar(require("./controllers/walletTransaction.controller"));
const transactionController = __importStar(require("./controllers/transaction.controller"));
// API keys and Passport configuration
const passportConfig = __importStar(require("./config/passport"));
const sequelize_1 = __importDefault(require("./sequelize"));
const user_model_1 = require("./models/user.model");
const staff_model_1 = require("./models/staff.model");
const student_model_1 = require("./models/student.model");
const leaveRequest_model_1 = require("./models/leaveRequest.model");
const wallet_model_1 = require("./models/wallet.model");
const walletTransaction_model_1 = require("./models/walletTransaction.model");
const transaction_model_1 = require("./models/transaction.model");
// Create Express server
const app = express_1.default();
app.use(cors_1.default());
// Initialize models
user_model_1.init();
staff_model_1.init();
student_model_1.init();
leaveRequest_model_1.init();
wallet_model_1.init();
walletTransaction_model_1.init();
transaction_model_1.init();
// Sync the database
sequelize_1.default
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
app.use(express_1.default.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express_1.default.urlencoded({ extended: true }));
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
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.File({ filename: "error.log", level: "error" }),
    ],
});
/**
 * Primary app routes.
 */
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Exiat application." });
});
app.get("/users", userController.getUsers);
app.get("/user/:id", userController.getUser);
app.post("/login", userController.postLogin);
app.post("/forgot", userController.postForgot);
app.post("/signup", userController.postSignup);
app.post("/account/profile", passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post("/account/password", passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post("/account/delete", passportConfig.isAuthenticated, userController.postDeleteAccount);
app.post("/leave-requests", leaveRequestController.getLeaveRequests);
app.post("/leave-request/:id", leaveRequestController.getLeaveRequest);
app.post("/submit-request", leaveRequestController.submitLeaveRequest);
app.post("/approve-leave-request", leaveRequestController.approveLeaveRequest);
app.post("/reject-leave-request", leaveRequestController.rejectLeaveRequest);
app.post("/check-in", leaveRequestController.checkInStudent);
app.post("/check-out", leaveRequestController.checkOutStudent);
app.post("/initialize-payment", payStackController.initializePayment);
app.post("/verify-transaction", walletController.verifyPayment);
app.post("/wallets", walletController.getWallets);
app.post("/wallet/:id", walletController.getWallet);
app.post("/wallet-transactions", walletTransactionController.getWalletTransactions);
app.post("/wallet-transaction/:id", walletTransactionController.getWalletTransaction);
app.post("/transactions", transactionController.getTransactions);
app.post("/transaction/:id", transactionController.getTransaction);
app.use((err, req, res, next) => {
    if (!res.headersSent) {
        logger.error(err.message);
        res.status(err.status || 500).json({ error: err.message });
    }
});
exports.default = app;
//# sourceMappingURL=app.js.map