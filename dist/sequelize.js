"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// sequelize.ts
const sequelize_1 = require("sequelize");
const mysql2_1 = __importDefault(require("mysql2"));
const secrets_1 = require("./util/secrets");
const sequelize = new sequelize_1.Sequelize({
    dialect: "mysql",
    host: secrets_1.MYSQL_DB_HOST,
    username: secrets_1.MYSQL_DB_USER,
    password: secrets_1.MYSQL_DB_PASSWORD,
    database: secrets_1.MYSQL_DB_NAME,
    dialectModule: mysql2_1.default,
});
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map