import errorHandler from "errorhandler";
import app from "./app";
import https from "https";
import http from "http";
import fs from "fs";

/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
	app.use(errorHandler());
}

/**
 * Start Express server.
 */
// const httpsOptions: any = {
// 	Key: fs.readFileSync("./src/certificates/ssl.key", "utf8"),
// 	cert: fs.readFileSync("./src/certificates/certificate.crt", "utf8"),
// };

// const httpServer = http.createServer(app).listen(process.env.PORT || 3001);
// const httpsServer = https.createServer(httpsOptions, app);

export default app;
