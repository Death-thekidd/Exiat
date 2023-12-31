import schedule from "node-schedule";
import { LeaveRequest } from "../models/leaveRequest.model";
import { Op } from "sequelize";
import { Student } from "../models/student.model";
import sendMail from "../sendMail";
import { createWalletTransaction } from "./wallet.controller";
import { CurrencyType } from "../models/walletTransaction.model";
import { TransactionType } from "../models/walletTransaction.model";
import { Wallet } from "../models/wallet.model";

const job = schedule.scheduleJob("0 0 * * *", async () => {
	try {
		const overdueRequests = await LeaveRequest.findAll({
			where: {
				returnDate: { [Op.lt]: new Date() }, // Find requests with return date in the past
				isCheckedIn: false, // Not checked in yet
				isCheckedOut: true, // Checked out
			},
		});

		for (const request of overdueRequests) {
			const fineAmount = 10000;

			const paymentResult = await processFinePayment(
				request.StudentID,
				fineAmount
			);

			if (paymentResult.success) {
				// Update the request's fine status
				request.isFinePaid = true;
				await request.save();

				// Notify the student about the fine payment
				await sendMail([], "", "");
			} else {
				// Handle payment failure
				console.error("Fine payment failed for request:", request.id);
			}
		}
	} catch (error) {
		console.error("Error processing fines:", error);
	}
});

interface fineReturn {
	success: boolean;
	message: string;
}

export const processFinePayment = async (
	studentID: string,
	amount: number
): Promise<fineReturn> => {
	try {
		const student = await Student.findByPk(studentID);
		const wallet = await Wallet.findOne({
			where: { UserID: student.UserID },
		});

		if (wallet.balance >= amount) {
			await createWalletTransaction(
				student.UserID,
				"completed",
				CurrencyType.NGN,
				1000,
				TransactionType.PAYMENT
			);
			wallet.balance -= amount;
			await wallet.save();
		} else throw new Error("Insufficient funds avilable to process fine");
	} catch (error) {
		return {
			success: false,
			message: error,
		};
	}

	return {
		success: true,
		message: "Fine processed succesfuly",
	};
};

job.invoke();
