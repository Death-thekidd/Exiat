import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

// Define the UserType enum
export enum UserType {
	Student = "Student",
	Secretary = "Secretary",
	ParentGuardian = "Parent/Guardian",
	SecurityGuard = "SecurityGuard",
}

export interface UserDocument extends Document {
	username: string;
	password: string;
	email: string;
	name: string;
	userType: UserType;
	passwordResetToken: string;
	passwordResetExpires: Date;
	tokens: AuthToken[];

	comparePassword: comparePasswordFunction;
}

type comparePasswordFunction = (
	candidatePassword: string,
	cb: (err: any, isMatch: any) => void
) => void;

export interface AuthToken {
	accessToken: string;
	kind: string;
}

const userSchema = new Schema<UserDocument>(
	{
		password: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		userType: { type: String, enum: Object.values(UserType), required: true },
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{ timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
	const user = this as UserDocument;
	if (!user.isModified("password")) {
		return next();
	}
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
			if (err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});

const comparePassword: comparePasswordFunction = function (
	candidatePassword,
	cb
) {
	bcrypt.compare(
		candidatePassword,
		this.password,
		(err: mongoose.Error, isMatch: boolean) => {
			cb(err, isMatch);
		}
	);
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>("User", userSchema);
