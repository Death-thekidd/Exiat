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
exports.processFinePayment = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const leaveRequest_model_1 = require("../models/leaveRequest.model");
const sequelize_1 = require("sequelize");
const student_model_1 = require("../models/student.model");
const sendMail_1 = __importDefault(require("../sendMail"));
const wallet_controller_1 = require("./wallet.controller");
const walletTransaction_model_1 = require("../models/walletTransaction.model");
const walletTransaction_model_2 = require("../models/walletTransaction.model");
const wallet_model_1 = require("../models/wallet.model");
const job = node_schedule_1.default.scheduleJob("0 0 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const overdueRequests = yield leaveRequest_model_1.LeaveRequest.findAll({
            where: {
                returnDate: { [sequelize_1.Op.lt]: new Date() },
                isCheckedIn: false,
                isCheckedOut: true, // Checked out
            },
        });
        for (const request of overdueRequests) {
            const fineAmount = 10000;
            const paymentResult = yield exports.processFinePayment(request.StudentID, fineAmount);
            if (paymentResult.success) {
                // Update the request's fine status
                request.isFinePaid = true;
                yield request.save();
                // Notify the student about the fine payment
                yield sendMail_1.default([], "", "");
            }
            else {
                // Handle payment failure
                console.error("Fine payment failed for request:", request.id);
            }
        }
    }
    catch (error) {
        console.error("Error processing fines:", error);
    }
}));
const processFinePayment = (studentID, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const student = yield student_model_1.Student.findByPk(studentID);
        const wallet = yield wallet_model_1.Wallet.findOne({
            where: { UserID: student.UserID },
        });
        if (wallet.balance >= amount) {
            yield wallet_controller_1.createWalletTransaction(student.UserID, "completed", walletTransaction_model_1.CurrencyType.NGN, 1000, walletTransaction_model_2.TransactionType.PAYMENT);
            wallet.balance -= amount;
            yield wallet.save();
        }
        else
            throw new Error("Insufficient funds avilable to process fine");
    }
    catch (error) {
        return {
            success: false,
            message: error,
        };
    }
    return {
        success: true,
        message: "Fine processed succesfuly",
    };
});
exports.processFinePayment = processFinePayment;
job.invoke();
//# sourceMappingURL=flag.controller.js.map