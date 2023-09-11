import {
	LeaveRequest,
	LeaveRequestInstance,
} from "../models/leaveRequest.model";
import { Student, StudentInstance } from "../models/student.model";
import { check, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import async from "async";
import { Wallet, WalletInstance } from "../models/wallet.model";
import { createWalletTransaction } from "./wallet.controller";
import {
	CurrencyType,
	TransactionType,
} from "../models/walletTransaction.model";

/**
 * Get all leave requests
 * @route GET /leave-requets
 */
export const getLeaveRequests = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const leaveRequests = await LeaveRequest.findAll();
		return res.status(200).json({ data: leaveRequests });
	} catch (error) {
		next(error);
	}
};

/**
 * Get leave request by ID
 * @route GET /leave-request/:id
 */
export const getLeaveRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const leaveRequestId = req.params.id;
		const leaveRequest = await LeaveRequest.findByPk(leaveRequestId);

		if (!leaveRequest) {
			return res.status(404).json({ message: "Leave Request not found" });
		}

		return res.status(200).json({ data: leaveRequest });
	} catch (error) {
		next(error);
	}
};

/**
 * Create leave request
 * @route POST /submit-request
 */
export const submitLeaveRequest = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
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
				async function checkStudent(
					done: (err: Error, student: StudentInstance) => void
				) {
					const student = await Student.findByPk(req.body.id);
					if (!student) {
						return done(new Error("Student not found."), null); // Pass an error to the next function
					}
					done(undefined, student);
				},
				async function checkBalance(
					student: StudentInstance,
					done: (
						err: Error | null,
						student: StudentInstance,
						wallet: WalletInstance
					) => void
				) {
					const wallet = await Wallet.findOne({
						where: { UserID: student.UserID },
					});
					if (wallet.balance <= 0) {
						return done(new Error("Insufficient Balance"), null, null); // Pass an error to the next function
					}
					done(null, student, wallet);
				},
				async function saveRequest(
					student: StudentInstance,
					wallet: WalletInstance,
					done: (
						err: Error,
						request: LeaveRequestInstance,
						student: StudentInstance,
						wallet: WalletInstance
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
						done(null, request, student, wallet);
					} catch (error) {
						console.error("Unable to create Leave request : ", error);
						return done(error, null, null, null); // Pass an error to the next function
					}
				},
				async function subtractFee(
					request: LeaveRequestInstance,
					student: StudentInstance,
					wallet: WalletInstance,
					done: (err: Error, request: LeaveRequestInstance) => void
				) {
					try {
						await createWalletTransaction(
							student.UserID,
							"completed",
							CurrencyType.NGN,
							1000,
							TransactionType.PAYMENT
						);
						wallet.balance -= 1;
						await wallet.save();
						done(null, request);
					} catch (error) {
						console.error("Unable to subtract fee : ", error);
						return done(error, null); // Pass an error to the next function
					}
				},
			],
			(err) => {
				if (err) {
					return next(err); // Handle errors at the end of the waterfall
				}

				return res
					.status(201)
					.json({ message: "Leave Request submitted successfully." });
			}
		);
	} catch (error) {
		return res.status(500).json({ error: error });
	}
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
