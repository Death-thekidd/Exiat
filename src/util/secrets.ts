import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
	logger.debug("Using .env file to supply config environment variables");
	dotenv.config({ path: ".env" });
} else {
	logger.debug(
		"Using .env.example file to supply config environment variables"
	);
	dotenv.config({ path: ".env.example" }); // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production"; // Anything else is treated as 'dev'

export const SESSION_SECRET = process.env["SESSION_SECRET"];
export const MYSQL_DB_HOST = prod
	? process.env["MYSQL_DB_HOST"]
	: process.env["MYSQL_DB_HOST_LOCAL"];

export const MYSQL_DB_NAME = process.env["MYSQL_DB_NAME"];
export const MYSQL_DB_USER = process.env["MYSQL_DB_USER"];
export const MYSQL_DB_PASSWORD = process.env["MYSQL_DB_PASSWORD"];

if (!SESSION_SECRET) {
	logger.error("No client secret. Set SESSION_SECRET environment variable.");
	process.exit(1);
}

if (!MYSQL_DB_HOST) {
	if (prod) {
		logger.error("No mysql host. Set MYSQL_DB_HOST environment variable.");
	} else {
		logger.error(
			"No mysql host. Set MYSQL_DB_HOST_LOCAL environment variable."
		);
	}
	process.exit(1);
}
