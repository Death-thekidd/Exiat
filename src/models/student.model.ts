import { DataTypes, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt-nodejs";
import sequelize from "../sequelize";
import { User } from "./user.model";
import { LeaveRequest } from "./leaveRequest.model";

// Define the UserType enum
export enum StudentType {}

export interface StudentDocument {
	id?: number;
	UserID: string;
	guardianEmail: string;
	guardianPhone: string;
	guardianName: string;
	username: string;
	password: string;
	email: string;
	name: string;
}

export interface StudentInstance
	extends Model<StudentDocument>,
		StudentDocument {}

export const initStudentModel = (sequelize: Sequelize) => {
	const Student = sequelize.define<StudentInstance>("Student", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			autoIncrement: false,
			primaryKey: true,
		},
		UserID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
		username: { type: DataTypes.STRING, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		guardianEmail: { type: DataTypes.STRING, allowNull: false },
		guardianPhone: { type: DataTypes.STRING, allowNull: false },
		guardianName: { type: DataTypes.STRING, allowNull: false },
	});

	return Student;
};

export const Student = initStudentModel(sequelize);

export async function init() {
	try {
		await Student.sequelize.sync();
		// console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
