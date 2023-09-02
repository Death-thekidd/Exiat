import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../sequelize";
import { User } from "./user.model";
import { Student } from "./student.model";
import { Staff } from "./staff.model";

// Define the UserType enum
export enum StaffType {
	DOS = "Dean of Student",
	CSO = "Chief of Security",
	CA = "Course Advisor",
	AOD = "Assistant fo Dean",
}

export interface LeaveRequestDocument {
	id: string;
	reason: string;
	departureDate: Date;
	returnDate: Date;
	isApproved: boolean;
	isCheckedIn: boolean;
	isFinePaid: boolean;
	StudentID: number;
	StaffID: number;
}

export interface LeaveRequestInstance
	extends Model<LeaveRequestDocument>,
		LeaveRequestDocument {}

export interface AuthToken {
	accessToken: string;
	kind: string;
}

export const initLeaveRequestModel = (sequelize: Sequelize) => {
	const LeaveRequest = sequelize.define<LeaveRequestInstance>("Staff", {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			autoIncrement: false,
			primaryKey: true,
		},
		reason: { type: DataTypes.STRING, allowNull: false },
		departureDate: { type: DataTypes.DATE, allowNull: false },
		returnDate: { type: DataTypes.DATE, allowNull: false },
		isApproved: { type: DataTypes.BOOLEAN, allowNull: false },
		isCheckedIn: { type: DataTypes.BOOLEAN, allowNull: false },
		isFinePaid: { type: DataTypes.BOOLEAN, allowNull: false },
		StudentID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: Student,
				key: "id",
			},
		},
		StaffID: {
			type: DataTypes.UUID,
			references: {
				model: Staff,
				key: "id",
			},
		},
	});

	return LeaveRequest;
};

export const LeaveRequest = initLeaveRequestModel(sequelize);

export async function init() {
	try {
		await LeaveRequest.sequelize.sync();
		console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
