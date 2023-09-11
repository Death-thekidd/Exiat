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
exports.checkOutStudent = exports.checkInStudent = exports.rejectLeaveRequest = exports.approveLeaveRequest = exports.submitLeaveRequest = exports.getLeaveRequest = exports.getLeaveRequests = void 0;
const leaveRequest_model_1 = require("../models/leaveRequest.model");
const student_model_1 = require("../models/student.model");
const express_validator_1 = require("express-validator");
const async_1 = __importDefault(require("async"));
const wallet_model_1 = require("../models/wallet.model");
const wallet_controller_1 = require("./wallet.controller");
const walletTransaction_model_1 = require("../models/walletTransaction.model");
/**
 * Get all leave requests
 * @route GET /leave-requets
 */
const getLeaveRequests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaveRequests = yield leaveRequest_model_1.LeaveRequest.findAll();
        return res.status(200).json({ data: leaveRequests });
    }
    catch (error) {
        next(error);
    }
});
exports.getLeaveRequests = getLeaveRequests;
/**
 * Get leave request by ID
 * @route GET /leave-request/:id
 */
const getLeaveRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaveRequestId = req.params.id;
        const leaveRequest = yield leaveRequest_model_1.LeaveRequest.findByPk(leaveRequestId);
        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave Request not found" });
        }
        return res.status(200).json({ data: leaveRequest });
    }
    catch (error) {
        next(error);
    }
});
exports.getLeaveRequest = getLeaveRequest;
/**
 * Create leave request
 * @route POST /submit-request
 */
const submitLeaveRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield express_validator_1.check("reason", "Reason can not be blank")
            .isLength({ min: 1 })
            .run(req);
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty()) {
            // Return validation errors as JSON
            return res.status(400).json({ errors: errors.array() });
        }
        async_1.default.waterfall([
            function checkStudent(done) {
                return __awaiter(this, void 0, void 0, function* () {
                    const student = yield student_model_1.Student.findByPk(req.body.id);
                    if (!student) {
                        return done(new Error("Student not found."), null); // Pass an error to the next function
                    }
                    done(undefined, student);
                });
            },
            function checkBalance(student, done) {
                return __awaiter(this, void 0, void 0, function* () {
                    const wallet = yield wallet_model_1.Wallet.findOne({
                        where: { UserID: student.UserID },
                    });
                    if (wallet.balance <= 0) {
                        return done(new Error("Insufficient Balance"), null, null); // Pass an error to the next function
                    }
                    done(null, student, wallet);
                });
            },
            function saveRequest(student, wallet, done) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const { reason, departureDate, returnDate, id } = req.body;
                        const request = yield leaveRequest_model_1.LeaveRequest.create({
                            reason: reason,
                            departureDate: departureDate,
                            returnDate: returnDate,
                            StudentID: id,
                        });
                        done(null, request, student, wallet);
                    }
                    catch (error) {
                        console.error("Unable to create Leave request : ", error);
                        return done(error, null, null, null); // Pass an error to the next function
                    }
                });
            },
            function subtractFee(request, student, wallet, done) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield wallet_controller_1.createWalletTransaction(student.UserID, "completed", walletTransaction_model_1.CurrencyType.NGN, 1000, walletTransaction_model_1.TransactionType.PAYMENT);
                        wallet.balance -= 1;
                        yield wallet.save();
                        done(null, request);
                    }
                    catch (error) {
                        console.error("Unable to subtract fee : ", error);
                        return done(error, null); // Pass an error to the next function
                    }
                });
            },
        ], (err) => {
            if (err) {
                return next(err); // Handle errors at the end of the waterfall
            }
            return res
                .status(201)
                .json({ message: "Leave Request submitted successfully." });
        });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.submitLeaveRequest = submitLeaveRequest;
/**
 * approve leave request by staff
 * @route POST /approve-leave-request
 * @param req
 * @param res
 * @param next
 * @returns
 */
const approveLeaveRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield leaveRequest_model_1.LeaveRequest.findByPk(req.body.requestID);
        if (!request) {
            return res
                .status(500)
                .json({ success: false, error: "Leave request not found." });
        }
        // Check if the user is authorized to approve requests (implement authorization logic)
        // Update the request's approval status
        request.isApproved = true;
        request.StaffID = req.body.staffID;
        yield request.save();
        // Notify the student that their request is approved
        return res
            .status(200)
            .json({ success: true, message: "Leave request approved successfully." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Failed to approve leave request." });
    }
});
exports.approveLeaveRequest = approveLeaveRequest;
/**
 * reject leave request by staff
 * @route POST /reject-leave-request
 * @param req
 * @param res
 * @param next
 * @returns
 */
const rejectLeaveRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield leaveRequest_model_1.LeaveRequest.findByPk(req.body.requestID);
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
        yield request.save();
        // Notify the student that their request is approved
        return res
            .status(200)
            .json({ success: true, message: "Leave request rejected successfully." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Failed to reject leave request." });
    }
});
exports.rejectLeaveRequest = rejectLeaveRequest;
/**
 * @route POST /check-in
 * @returns
 */
const checkInStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield leaveRequest_model_1.LeaveRequest.findByPk(req.body.requestID);
        if (!request) {
            return res
                .status(500)
                .json({ success: false, error: "Leave request not found." });
        }
        // Update the request's check-in status
        request.isCheckedIn = true;
        request.isCheckedOut = false;
        yield request.save();
        // Notify the student that they are checked in
        return res
            .status(200)
            .json({ success: true, message: "Student checked in successfully." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Failed to check in student." });
    }
});
exports.checkInStudent = checkInStudent;
/**
 * @route POST /check-out
 * @returns
 */
const checkOutStudent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = yield leaveRequest_model_1.LeaveRequest.findByPk(req.body.requestID);
        if (!request) {
            return res
                .status(500)
                .json({ success: false, error: "Leave request not found." });
        }
        // Update the request's check-in status
        request.isCheckedOut = true;
        request.isCheckedIn = false;
        yield request.save();
        // Notify the student that they are checked in
        return res
            .status(200)
            .json({ success: true, message: "Student checked in successfully." });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, error: "Failed to check in student." });
    }
});
exports.checkOutStudent = checkOutStudent;
//# sourceMappingURL=leaveRequest.controller.js.map