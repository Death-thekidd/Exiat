"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// sequelize.ts
const sequelize_1 = require("sequelize");
const secrets_1 = require("./util/secrets");
const sequelize = new sequelize_1.Sequelize({
    dialect: "mysql",
    host: secrets_1.MYSQL_DB_HOST,
    username: secrets_1.MYSQL_DB_USER,
    password: secrets_1.MYSQL_DB_PASSWORD,
    database: secrets_1.MYSQL_DB_NAME, // Your MySQL database name
});
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map