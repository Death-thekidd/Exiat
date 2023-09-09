// sequelize.ts
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";
import {
	MYSQL_DB_HOST,
	MYSQL_DB_NAME,
	MYSQL_DB_PASSWORD,
	MYSQL_DB_USER,
} from "./util/secrets";

const sequelize = new Sequelize({
	dialect: "mysql", // Use 'mysql' for MySQL
	host: MYSQL_DB_HOST, // Your MySQL host
	username: MYSQL_DB_USER, // Your MySQL username
	password: MYSQL_DB_PASSWORD, // Your MySQL password
	database: MYSQL_DB_NAME, // Your MySQL database name
	dialectModule: mysql2,
});

export default sequelize;
