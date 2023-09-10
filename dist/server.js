"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorhandler_1 = __importDefault(require("errorhandler"));
const app_1 = __importDefault(require("./app"));
/**
 * Error Handler. Provides full stack
 */
if (process.env.NODE_ENV === "development") {
    app_1.default.use(errorhandler_1.default());
}
exports.default = app_1.default;
//# sourceMappingURL=server.js.map