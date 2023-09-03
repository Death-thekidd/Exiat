import schedule from "node-schedule";
import { LeaveRequest } from "../models/leaveRequest.model";
import https from "https";
import { PAYSTACK_PUBLIC_KEY } from "../util/secrets";
import { Op } from "sequelize";
import { Student } from "../models/student.model";
import sendMail from "../sendMail";

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
			const fineAmount = 10;

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
		if (student.balance >= amount) student.balance -= amount;
		else throw new Error("Insufficient tokens avilable to process fine");
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
