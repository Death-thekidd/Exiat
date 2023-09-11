import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import {
	User,
	UserDocument,
	AuthToken,
	UserInstance,
} from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { body, check, validationResult } from "express-validator";
import "../config/passport";
import { CallbackError, NativeError } from "mongoose";
import { Op } from "sequelize";
import sequelize from "../sequelize";
import { Staff } from "../models/staff.model";
import { Student } from "../models/student.model";
import sendMail from "../sendMail";

/**
 * Get all users
 * @route GET /users
 */
export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const users = await User.findAll();
		return res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

/**
 * Get User by ID
 * @route GET /user/:id
 */
export const getUser = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const userId = req.params.id;
		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.userType === "Student") {
			const student = await Student.findOne({
				where: { UserID: user.id },
			});
			return res.status(200).json({ data: student });
		}
		const staff = await Staff.findOne({
			where: { UserID: user.id },
		});
		return res.status(200).json({ data: staff });
	} catch (error) {
		next(error);
	}
};

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("email", "Email is not valid").isEmail().run(req);
	await check("password", "Password cannot be blank")
		.isLength({ min: 1 })
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Return validation errors as JSON
		return res.status(400).json({ errors: errors.array() });
	}

	passport.authenticate(
		"local",
		(err: Error, user: UserDocument, info: IVerifyOptions) => {
			if (err) {
				return res.status(500).json({ error: err.message }); // Internal server error
			}
			if (!user) {
				// Return authentication failure as JSON
				return res.status(401).json({ error: info.message }); // Unauthorized
			}
			req.logIn(user, (err) => {
				if (err) {
					return res.status(500).json({ error: err.message }); // Internal server error
				}
				// Return success message and user data as JSON
				return res
					.status(200)
					.json({ message: "Success! You are logged in.", user });
			});
		}
	)(req, res, next);
};

/**
 * Log out.
 * @route GET /logout
 */
export const logout = async (
	req: Request,
	res: Response
): Promise<Response<any, Record<string, any>>> => {
	req.logout();
	return res.status(200).json({ message: "Success! You are logged out." });
};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("email", "Email is not valid").isEmail().run(req);
	await check("password", "Password must be at least 4 characters long")
		.isLength({ min: 4 })
		.run(req);
	await check("confirmPassword", "Passwords do not match")
		.equals(req.body.password)
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Return validation errors as JSON
		return res.status(400).json({ errors: errors.array() });
	}

	const existingUser = await User.findOne({ where: { email: req.body.email } });

	if (existingUser) {
		console.error("User with this email already exists");
		return res
			.status(409)
			.json({ error: "Account with that email address already exists." });
	}

	try {
		const user = await User.create({
			username: req.body.username,
			name: req.body.name,
			userType: req.body.userType,
			password: req.body.password,
			email: req.body.email,
		});
		if (req.body.userType === "Staff") {
			const staff = await Staff.create({
				staffType: req.body.staffType,
				username: user.username,
				name: user.name,
				email: user.email,
				password: user.password,
				UserID: user.id, // Associate with the User
			});
		} else {
			const student = await Student.create({
				guardianEmail: req.body.guardianEmail,
				guardianPhone: req.body.guardianPhone,
				guardianName: req.body.guardianName,
				username: user.username,
				name: user.name,
				email: user.email,
				password: user.password,
				UserID: user.id, // Associate with the User
			});
		}
	} catch (error) {
		console.error("Unable to create User record : ", error);
		return res.status(500).json({ error: "Something went wrong" });
	}

	return res.status(201).json({ message: "User registered successfully." });
};

/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("email", "Please enter a valid email address.")
		.isEmail()
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Return validation errors as JSON
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const userId = (req.user as UserDocument).id; // Assuming you have a user object in the request with an 'id' property
		const updatedFields: any = {};

		if (req.body.email) {
			updatedFields.email = req.body.email;
		}

		const [updatedRowsCount] = await User.update(updatedFields, {
			where: { id: userId },
		});

		if (updatedRowsCount === 0) {
			return res.status(404).json({ message: "User not found." });
		}

		return res
			.status(200)
			.json({ message: "Profile information has been updated." });
	} catch (error) {
		if (error.name === "SequelizeUniqueConstraintError") {
			// Handle the case where the email is already associated with another account
			return res.status(409).json({
				error: "The email address is already associated with an account.",
			});
		}
		next(error);
	}
};

/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("password", "Password must be at least 4 characters long")
		.isLength({ min: 4 })
		.run(req);
	await check("confirmPassword", "Passwords do not match")
		.equals(req.body.password)
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Return validation errors as JSON
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const userId = (req.user as UserInstance).id; // Assuming you have a user object in the request with an 'id' property

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		user.password = req.body.password;

		await user.save();

		return res.status(200).json({ message: "Password has been changed." });
	} catch (error) {
		next(error);
	}
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
export const postDeleteAccount = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const userId = (req.user as UserInstance).id; // Assuming you have a user object in the request with an 'id' property

		const user = await User.findByPk(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		await user.destroy();

		// If you're using Passport.js for authentication, you can log the user out
		req.logout();

		return res.status(200).json({ message: "Your account has been deleted" });
	} catch (error) {
		next(error);
	}
};

/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
export const postReset = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("password", "Password must be at least 4 characters long.")
		.isLength({ min: 4 })
		.run(req);
	await check("confirm", "Passwords must match.")
		.equals(req.body.password)
		.run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	async.waterfall(
		[
			async function resetPassword(
				done: (err: any, user: UserDocument) => void
			) {
				try {
					const { token } = req.params;
					const user = await User.findOne({
						where: {
							passwordResetToken: token,
							passwordResetExpires: {
								[Op.gt]: new Date(), // Check if the reset token has not expired
							},
						},
					});

					if (!user) {
						return res.status(401).json({
							message: "Password reset token is invalid or has expired.",
						});
					}

					// Update the user's password and reset token
					user.password = req.body.password;
					user.passwordResetToken = null; // Assuming your column allows null values
					user.passwordResetExpires = null; // Assuming your column allows null values

					await user.save();

					// You can log the user in here if needed
					// req.logIn(user, (err) => {
					//   if (err) {
					//     return next(err);
					//   }
					//   res.json({ message: 'Password reset successful.' });
					// });

					done(undefined, user);
				} catch (error) {
					return next(error);
				}
			},
			function sendResetPasswordEmail(
				user: UserDocument,
				done: (err: Error) => void
			) {
				const transporter = nodemailer.createTransport({
					service: "SendGrid",
					auth: {
						user: process.env.SENDGRID_USER,
						pass: process.env.SENDGRID_PASSWORD,
					},
				});
				const mailOptions = {
					to: user.email,
					from: "express-ts@starter.com",
					subject: "Your password has been changed",
					text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
				};
				transporter.sendMail(mailOptions, (err) => {
					done(err);
				});
			},
		],
		(err) => {
			if (err) {
				return next(err);
			}
		}
	);
	return res
		.status(200)
		.json({ message: "Password reset email sent successfully." });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("email", "Please enter a valid email address.")
		.isEmail()
		.run(req);
	await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	async.waterfall(
		[
			function createRandomToken(done: (err: Error, token: string) => void) {
				crypto.randomBytes(16, (err, buf) => {
					const token = buf.toString("hex");
					done(err, token);
				});
			},
			async function setRandomToken(
				token: string,
				done: (
					err: NativeError | WriteError,
					token?: string,
					user?: UserDocument
				) => void
			) {
				try {
					const { email } = req.body;

					const user = await User.findOne({ where: { email } });

					if (!user) {
						return res.status(404).json({
							message: "Account with that email address does not exist.",
						});
					}
					const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

					user.passwordResetToken = token;
					user.passwordResetExpires = resetExpires;

					await user.save();

					done(null, token, user);
				} catch (error) {
					done(error);
				}
			},
			async function sendForgotPasswordEmail(
				token: string,
				user: UserDocument,
				done: (err: Error) => void
			) {
				try {
					await sendMail(
						[user.email],
						"Reset your password on Exiat",
						`You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
					Please click on the following link, or paste this into your browser to complete the process:\n\n
					http://${req.headers.host}/reset/${token}\n\n
					If you did not request this, please ignore this email and your password will remain unchanged.\n`
					);
					done(undefined);
				} catch (err) {
					done(err);
				}
			},
		],
		(err) => {
			if (err) {
				return next(err);
			}
		}
	);
	return res
		.status(200)
		.json({ message: "An e-mail has been sent with further instructions." });
};
