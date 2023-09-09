"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const app_1 = __importDefault(require("./app"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
    app_1.default.use(errorhandler_1.default());
}
/**
 * Start Express server.
 */
const httpsOptions = {
    Key: fs_1.default.readFileSync("./src/certificates/ssl.key", "utf8"),
    cert: fs_1.default.readFileSync("./src/certificates/certificate.crt", "utf8"),
};
const httpServer = http_1.default.createServer(app_1.default).listen(process.env.PORT || 3001);
const httpsServer = https_1.default.createServer(httpsOptions, app_1.default);
const server = httpsServer.listen(app_1.default.get("port"), () => {
    console.log("  App is running at http://localhost:%d in %s mode", app_1.default.get("port"), app_1.default.get("env"));
    console.log("  Press CTRL-C to stop\n");
});
exports.default = httpServer;
//# sourceMappingURL=server.js.map