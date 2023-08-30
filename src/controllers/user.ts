import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import { body, check, validationResult } from "express-validator";
import "../config/passport";
import { CallbackError, NativeError } from "mongoose";

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

	const user = new User({
		email: req.body.email,
		password: req.body.password,
	});

	User.findOne(
		{ email: req.body.email },
		(err: NativeError, existingUser: UserDocument) => {
			if (err) {
				return next(err);
			}
			if (existingUser) {
				// Return account already exists error as JSON
				return res
					.status(409)
					.json({ error: "Account with that email address already exists." });
			}
			user.save((err) => {
				if (err) {
					return next(err);
				}
				return res
					.status(201)
					.json({ message: "User registered successfully." });
			});
		}
	);
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

	const user = req.user as UserDocument;
	User.findById(user.id, (err: NativeError, user: UserDocument) => {
		if (err) {
			return next(err);
		}
		user.email = req.body.email || "";
		user.save((err: WriteError & CallbackError) => {
			if (err) {
				if (err.code === 11000) {
					// Return email already associated with an account error as JSON
					return res.status(409).json({
						error: "The email address is already associated with an account.",
					});
				}
				return next(err);
			}
			// Return success message as JSON
			return res
				.status(200)
				.json({ message: "Profile information has been updated." });
		});
	});
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

	const user = req.user as UserDocument;
	User.findById(user.id, (err: NativeError, user: UserDocument) => {
		if (err) {
			return next(err);
		}
		user.password = req.body.password;
		user.save((err: WriteError & CallbackError) => {
			if (err) {
				return next(err);
			}
			// Return success message as JSON
			return res.status(200).json({ message: "Password has been changed." });
		});
	});
};

/**
 * Delete user account.
 * @route POST /account/delete
 */
export const postDeleteAccount = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const user = req.user as UserDocument;
	User.remove({ _id: user.id }, (err) => {
		if (err) {
			return next(err);
		}
		req.logout();
		return res.status(200).json({ message: "Your account has been deleted" });
	});
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
			function resetPassword(done: (err: any, user: UserDocument) => void) {
				User.findOne({ passwordResetToken: req.params.token })
					.where("passwordResetExpires")
					.gt(Date.now())
					.exec((err, user: any) => {
						if (err) {
							return next(err);
						}
						if (!user) {
							return res.status(401).json({
								message: "Password reset token is invalid or has expired.",
							});
						}
						user.password = req.body.password;
						user.passwordResetToken = undefined;
						user.passwordResetExpires = undefined;
						user.save((err: WriteError) => {
							if (err) {
								return next(err);
							}
							// req.logIn(user, (err) => {
							// 	done(err, user);
							// });
							done(err, user);
						});
					});
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
			function setRandomToken(
				token: AuthToken,
				done: (
					err: NativeError | WriteError,
					token?: AuthToken,
					user?: UserDocument
				) => void
			) {
				User.findOne(
					{ email: req.body.email },
					(err: NativeError, user: any) => {
						if (err) {
							return done(err);
						}
						if (!user) {
							req.flash("errors", {
								msg: "Account with that email address does not exist.",
							});
							return res.redirect("/forgot");
						}
						user.passwordResetToken = token;
						user.passwordResetExpires = Date.now() + 3600000; // 1 hour
						user.save((err: WriteError) => {
							done(err, token, user);
						});
					}
				);
			},
			function sendForgotPasswordEmail(
				token: AuthToken,
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
					from: "hackathon@starter.com",
					subject: "Reset your password on Hackathon Starter",
					text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`,
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
		.json({ message: "An e-mail has been sent with further instructions." });
};
