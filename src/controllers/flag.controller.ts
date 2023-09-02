import schedule from "node-schedule";
import { LeaveRequest } from "../models/leaveRequest.model";
import { Op } from "sequelize";

const job = schedule.scheduleJob("0 0 * * *", async () => {
	try {
		const overdueRequests = await LeaveRequest.findAll({
			where: {
				returnDate: { [Op.lt]: new Date() }, // Find requests with return date in the past
				isCheckedIn: false, // Not checked in yet
			},
		});

		for (const request of overdueRequests) {
			// Assess fines for overdue requests
			// Calculate the fine amount and process payment
			// Update the request's fine status
			// Notify the student about the fine
		}
	} catch (error) {
		console.error("Error processing fines:", error);
	}
});

// Start the job
job.invoke();
