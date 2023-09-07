"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postForgot = exports.postReset = exports.postDeleteAccount = exports.postUpdatePassword = exports.postUpdateProfile = exports.postSignup = exports.logout = exports.postLogin = void 0;
const async_1 = __importDefault(require("async"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const passport_1 = __importDefault(require("passport"));
const user_model_1 = require("../models/user.model");
const express_validator_1 = require("express-validator");
require("../config/passport");
const sequelize_1 = require("sequelize");
const staff_model_1 = require("../models/staff.model");
const student_model_1 = require("../models/student.model");
/**
 * Sign in using email and password.
 * @route POST /login
 */
const postLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("email", "Email is not valid").isEmail().run(req);
    yield express_validator_1.check("password", "Password cannot be blank")
        .isLength({ min: 1 })
        .run(req);
    yield express_validator_1.body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors as JSON
        return res.status(400).json({ errors: errors.array() });
    }
    passport_1.default.authenticate("local", (err, user, info) => {
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
    })(req, res, next);
});
exports.postLogin = postLogin;
/**
 * Log out.
 * @route GET /logout
 */
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.logout();
    return res.status(200).json({ message: "Success! You are logged out." });
});
exports.logout = logout;
/**
 * Create a new local account.
 * @route POST /signup
 */
const postSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("email", "Email is not valid").isEmail().run(req);
    yield express_validator_1.check("password", "Password must be at least 4 characters long")
        .isLength({ min: 4 })
        .run(req);
    yield express_validator_1.check("confirmPassword", "Passwords do not match")
        .equals(req.body.password)
        .run(req);
    yield express_validator_1.body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors as JSON
        return res.status(400).json({ errors: errors.array() });
    }
    const existingUser = yield user_model_1.User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
        console.error("User with this email already exists");
        return res
            .status(409)
            .json({ error: "Account with that email address already exists." });
    }
    try {
        const user = yield user_model_1.User.create({
            username: req.body.username,
            name: req.body.name,
            userType: req.body.userType,
            password: req.body.password,
            email: req.body.email,
        });
        if (req.body.userType === "Staff") {
            const staff = yield staff_model_1.Staff.create({
                staffType: req.body.staffType,
                UserID: user.id, // Associate with the User
            });
        }
        else {
            const student = yield student_model_1.Student.create({
                guardianEmail: req.body.guardianEmail,
                guardianPhone: req.body.guardianPhone,
                guardianName: req.body.guardianName,
                UserID: user.id, // Associate with the User
            });
        }
    }
    catch (error) {
        console.error("Unable to create table : ", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
    return res.status(201).json({ message: "User registered successfully." });
});
exports.postSignup = postSignup;
/**
 * Update profile information.
 * @route POST /account/profile
 */
const postUpdateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("email", "Please enter a valid email address.")
        .isEmail()
        .run(req);
    yield express_validator_1.body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors as JSON
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.id; // Assuming you have a user object in the request with an 'id' property
        const updatedFields = {};
        if (req.body.email) {
            updatedFields.email = req.body.email;
        }
        const [updatedRowsCount] = yield user_model_1.User.update(updatedFields, {
            where: { id: userId },
        });
        if (updatedRowsCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        return res
            .status(200)
            .json({ message: "Profile information has been updated." });
    }
    catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            // Handle the case where the email is already associated with another account
            return res.status(409).json({
                error: "The email address is already associated with an account.",
            });
        }
        next(error);
    }
});
exports.postUpdateProfile = postUpdateProfile;
/**
 * Update current password.
 * @route POST /account/password
 */
const postUpdatePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("password", "Password must be at least 4 characters long")
        .isLength({ min: 4 })
        .run(req);
    yield express_validator_1.check("confirmPassword", "Passwords do not match")
        .equals(req.body.password)
        .run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        // Return validation errors as JSON
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const userId = req.user.id; // Assuming you have a user object in the request with an 'id' property
        const user = yield user_model_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        user.password = req.body.password;
        yield user.save();
        return res.status(200).json({ message: "Password has been changed." });
    }
    catch (error) {
        next(error);
    }
});
exports.postUpdatePassword = postUpdatePassword;
/**
 * Delete user account.
 * @route POST /account/delete
 */
const postDeleteAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id; // Assuming you have a user object in the request with an 'id' property
        const user = yield user_model_1.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        yield user.destroy();
        // If you're using Passport.js for authentication, you can log the user out
        req.logout();
        return res.status(200).json({ message: "Your account has been deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.postDeleteAccount = postDeleteAccount;
/**
 * Process the reset password request.
 * @route POST /reset/:token
 */
const postReset = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("password", "Password must be at least 4 characters long.")
        .isLength({ min: 4 })
        .run(req);
    yield express_validator_1.check("confirm", "Passwords must match.")
        .equals(req.body.password)
        .run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    async_1.default.waterfall([
        function resetPassword(done) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { token } = req.params;
                    const user = yield user_model_1.User.findOne({
                        where: {
                            passwordResetToken: token,
                            passwordResetExpires: {
                                [sequelize_1.Op.gt]: new Date(), // Check if the reset token has not expired
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
                    yield user.save();
                    // You can log the user in here if needed
                    // req.logIn(user, (err) => {
                    //   if (err) {
                    //     return next(err);
                    //   }
                    //   res.json({ message: 'Password reset successful.' });
                    // });
                    done(undefined, user);
                }
                catch (error) {
                    return next(error);
                }
            });
        },
        function sendResetPasswordEmail(user, done) {
            const transporter = nodemailer_1.default.createTransport({
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
    ], (err) => {
        if (err) {
            return next(err);
        }
    });
    return res
        .status(200)
        .json({ message: "Password reset email sent successfully." });
});
exports.postReset = postReset;
/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
const postForgot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield express_validator_1.check("email", "Please enter a valid email address.")
        .isEmail()
        .run(req);
    yield express_validator_1.body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    const errors = express_validator_1.validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    async_1.default.waterfall([
        function createRandomToken(done) {
            crypto_1.default.randomBytes(16, (err, buf) => {
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        function setRandomToken(token, done) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { email } = req.body;
                    const user = yield user_model_1.User.findOne({ where: { email } });
                    if (!user) {
                        return res.status(404).json({
                            message: "Account with that email address does not exist.",
                        });
                    }
                    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now
                    user.passwordResetToken = token;
                    user.passwordResetExpires = resetExpires;
                    yield user.save();
                    done(null, token, user);
                }
                catch (error) {
                    done(error);
                }
            });
        },
        function sendForgotPasswordEmail(token, user, done) {
            const transporter = nodemailer_1.default.createTransport({
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
    ], (err) => {
        if (err) {
            return next(err);
        }
    });
    return res
        .status(200)
        .json({ message: "An e-mail has been sent with further instructions." });
});
exports.postForgot = postForgot;
//# sourceMappingURL=user.js.map