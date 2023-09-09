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
const httpsOptions: any = {
	privateKey: fs.readFileSync("./src/certificates/ssl.key", "utf8"),
	certificate: fs.readFileSync("./src/certificates/certificate.crt", "utf8"),
};

const httpServer = http.createServer(app).listen(process.env.PORT || 3001);
const httpsServer = https.createServer(httpsOptions, app);
const server = httpsServer.listen(app.get("port"), () => {
	console.log(
		"  App is running at http://localhost:%d in %s mode",
		app.get("port"),
		app.get("env")
	);
	console.log("  Press CTRL-C to stop\n");
});

export default httpServer;
