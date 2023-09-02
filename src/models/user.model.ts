import { DataTypes, Model, Sequelize } from "sequelize";
import bcrypt from "bcrypt-nodejs";
import sequelize from "../sequelize";
import { Staff } from "./staff.model";
import { Student } from "./student.model";

// Define the UserType enum
export enum UserType {
	Student = "Student",
	Secretary = "Secretary",
	ParentGuardian = "Parent/Guardian",
	SecurityGuard = "SecurityGuard",
}

export interface UserDocument {
	id?: string;
	username: string;
	password: string;
	email: string;
	name: string;
	userType: UserType;
	passwordResetToken: string | null;
	passwordResetExpires: Date | null;
}

export interface UserInstance extends Model<UserDocument>, UserDocument {
	comparePassword(
		candidatePassword: string,
		cb: (err: any, isMatch: any) => void
	): Promise<boolean>;
}

export interface AuthToken {
	accessToken: string;
	kind: string;
}

export const initUserModel = (sequelize: Sequelize) => {
	const User = sequelize.define<UserInstance>("User", {
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
		userType: { type: DataTypes.STRING, allowNull: false },
		passwordResetToken: { type: DataTypes.STRING },
		passwordResetExpires: { type: DataTypes.DATE },
	});

	// Password hash middleware
	User.beforeCreate(async (user) => {
		if (user.password) {
			const salt = bcrypt.genSaltSync(10);
			user.password = bcrypt.hashSync(user.password, salt);
		}
	});

	// Method to compare passwords
	User.prototype.comparePassword = async function (
		candidatePassword: string,
		cb: (err: any, isMatch: any) => void
	) {
		cb(undefined, bcrypt.compareSync(candidatePassword, this.password));
	};

	return User;
};

export const User = initUserModel(sequelize);

User.hasOne(Staff, { foreignKey: "UserID", as: "Staff" });
User.hasOne(Student, { foreignKey: "UserID", as: "Student" });
Student.belongsTo(User, {
	foreignKey: "UserID",
	constraints: false,
	as: "User",
});
Staff.belongsTo(User, {
	foreignKey: "UserID",
	constraints: false,
	as: "User",
});

export async function init() {
	try {
		await User.sequelize.sync();
		console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
