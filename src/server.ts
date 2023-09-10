import errorHandler from "errorhandler";
import app from "./app";

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
	app.use(errorHandler());
}

export default app;
