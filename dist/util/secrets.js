"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYSTACK_SECRET_KEY = exports.PAYSTACK_PUBLIC_KEY = exports.SENDER_PASS = exports.SENDER_EMAIL = exports.MYSQL_DB_PASSWORD = exports.MYSQL_DB_USER = exports.MYSQL_DB_NAME = exports.MYSQL_DB_HOST = exports.SESSION_SECRET = exports.ENVIRONMENT = void 0;
const logger_1 = __importDefault(require("./logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
if (fs_1.default.existsSync(".env")) {
    logger_1.default.debug("Using .env file to supply config environment variables");
    dotenv_1.default.config({ path: ".env" });
}
else {
    logger_1.default.debug("Using .env.example file to supply config environment variables");
    dotenv_1.default.config({ path: ".env.example" }); // you can delete this after you create your own .env file!
}
exports.ENVIRONMENT = process.env.NODE_ENV;
const prod = exports.ENVIRONMENT === "production"; // Anything else is treated as 'dev'
exports.SESSION_SECRET = process.env["SESSION_SECRET"];
exports.MYSQL_DB_HOST = prod
    ? process.env["MYSQL_DB_HOST"]
    : process.env["MYSQL_DB_HOST_LOCAL"];
exports.MYSQL_DB_NAME = prod
    ? process.env["MYSQL_DB_NAME"]
    : process.env["MYSQL_DB_NAME_LOCAL"];
exports.MYSQL_DB_USER = prod
    ? process.env["MYSQL_DB_USER"]
    : process.env["MYSQL_DB_USER_LOCAL"];
exports.MYSQL_DB_PASSWORD = prod
    ? process.env["MYSQL_DB_PASSWORD"]
    : process.env["MYSQL_DB_PASSWORD_LOCAL"];
exports.SENDER_EMAIL = process.env["SENDER_EMAIL"];
exports.SENDER_PASS = process.env["SENDER_PASS"];
exports.PAYSTACK_PUBLIC_KEY = process.env["PAYSTACK_PUBLIC_KEY"];
exports.PAYSTACK_SECRET_KEY = process.env["PAYSTACK_SECRET_KEY"];
if (!exports.SESSION_SECRET) {
    logger_1.default.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}
if (!exports.MYSQL_DB_HOST) {
    if (prod) {
        logger_1.default.error("No mysql host. Set MYSQL_DB_HOST environment variable.");
    }
    else {
        logger_1.default.error("No mysql host. Set MYSQL_DB_HOST_LOCAL environment variable.");
    }
    process.exit(1);
}
//# sourceMappingURL=secrets.js.map