import {
	LeaveRequest,
	LeaveRequestInstance,
} from "../models/leaveRequest.model";
import { Staff } from "../models/staff.model";
import { Student, StudentInstance } from "../models/student.model";
import { Op } from "sequelize";
import { body, check, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import passport from "passport";
import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendMail from "../sendMail";

/**
 * Create leave request
 * @route POST /submit-request
 */
export const submitLeaveRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	await check("reason", "Reason can not be blank")
		.isLength({ min: 1 })
		.run(req);
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		// Return validation errors as JSON
		return res.status(400).json({ errors: errors.array() });
	}

	async.waterfall(
		[
			async function checkBalance(
				done: (err: Error, student: StudentInstance) => void
			) {
				const student = await Student.findByPk(req.body.id);
				if (student.balance <= 0)
					return res.status(401).json({ error: "Insufficient Balance" });
				done(undefined, student);
			},
			async function saveRequest(
				student: StudentInstance,
				done: (
					err: Error,
					request: LeaveRequestInstance,
					student: StudentInstance
				) => void
			) {
				try {
					const { reason, departureDate, returnDate, id } = req.body;
					const request = await LeaveRequest.create({
						reason: reason,
						departureDate: departureDate,
						returnDate: returnDate,
						StudentID: id,
					});
					done(undefined, request, student);
				} catch (error) {
					console.error("Unable to create Leave request : ", error);
					return next(error);
				}
			},
			async function subtractFee(
				request: LeaveRequestInstance,
				student: StudentInstance,
				done: (err: Error, request: LeaveRequestInstance) => void
			) {
				try {
					student.balance -= 1;
					await student.save();
				} catch (error) {
					console.error("Unable to subtract fee : ", error);
					return next(error);
				}
				done(undefined, request);
			},
			// async function sendEmails(
			// 	request: LeaveRequestInstance,
			// 	done: (err: Error) => void
			// ) {
			// 	try {
			// 		await sendMail([], "", "");
			// 	} catch (error) {
			// 		console.error("Unable to send email : ", error);
			// 		return next(error);
			// 	}
			// },
		],
		(err) => {
			if (err) {
				return next(err);
			}
		}
	);

	return res
		.status(201)
		.json({ message: "Leave Request submitted successfully." });
};

/**
 * approve leave request by staff
 * @route POST /approve-leave-request
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const approveLeaveRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const request = await LeaveRequest.findByPk(req.body.requestID);

		if (!request) {
			return res
				.status(500)
				.json({ success: false, error: "Leave request not found." });
		}

		// Check if the user is authorized to approve requests (implement authorization logic)

		// Update the request's approval status
		request.isApproved = true;
		request.StaffID = req.body.staffID;
		await request.save();

		// Notify the student that their request is approved

		return res
			.status(200)
			.json({ success: true, message: "Leave request approved successfully." });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, error: "Failed to approve leave request." });
	}
};

/**
 * reject leave request by staff
 * @route POST /reject-leave-request
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const rejectLeaveRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const request = await LeaveRequest.findByPk(req.body.requestID);

		if (!request) {
			return res
				.status(500)
				.json({ success: false, error: "Leave request not found." });
		}

		// Check if the user is authorized to approve requests (implement authorization logic)

		// Update the request's approval status
		request.isApproved = false;
		request.isRejected = true;
		request.StaffID = req.body.staffID;
		await request.save();

		// Notify the student that their request is approved

		return res
			.status(200)
			.json({ success: true, message: "Leave request rejected successfully." });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, error: "Failed to reject leave request." });
	}
};

/**
 * @route POST /check-in
 * @returns
 */
export const checkInStudent = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const request = await LeaveRequest.findByPk(req.body.requestID);

		if (!request) {
			return res
				.status(500)
				.json({ success: false, error: "Leave request not found." });
		}

		// Update the request's check-in status
		request.isCheckedIn = true;
		request.isCheckedOut = false;
		await request.save();

		// Notify the student that they are checked in

		return res
			.status(200)
			.json({ success: true, message: "Student checked in successfully." });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, error: "Failed to check in student." });
	}
};
/**
 * @route POST /check-out
 * @returns
 */
export const checkOutStudent = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const request = await LeaveRequest.findByPk(req.body.requestID);

		if (!request) {
			return res
				.status(500)
				.json({ success: false, error: "Leave request not found." });
		}

		// Update the request's check-in status
		request.isCheckedOut = true;
		request.isCheckedIn = false;
		await request.save();

		// Notify the student that they are checked in

		return res
			.status(200)
			.json({ success: true, message: "Student checked in successfully." });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, error: "Failed to check in student." });
	}
};
