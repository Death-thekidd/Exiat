import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../sequelize";
import { User } from "./user.model";
import { LeaveRequest } from "./leaveRequest.model";

// Define the UserType enum
export enum StaffType {
	DOS = "Dean of Student",
	CSO = "Chief of Security",
	CA = "Course Advisor",
	AOD = "Assistant fo Dean",
}

export interface StaffDocument {
	id?: string;
	UserID: string;
	staffType: StaffType;
	username: string;
	password: string;
	email: string;
	name: string;
}

export interface StaffInstance extends Model<StaffDocument>, StaffDocument {}

export interface AuthToken {
	accessToken: string;
	kind: string;
}

export const initStaffModel = (sequelize: Sequelize) => {
	const Staff = sequelize.define<StaffInstance>("Staff", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			autoIncrement: false,
			primaryKey: true,
		},
		username: { type: DataTypes.STRING, allowNull: false },
		password: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		UserID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
		staffType: { type: DataTypes.STRING, allowNull: false },
	});

	return Staff;
};

export const Staff = initStaffModel(sequelize);

export async function init() {
	try {
		await Staff.sequelize.sync();
		// console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
