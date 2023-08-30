import mongoose, { Document, Schema } from "mongoose";

enum LeaveStatus {
	Pending = "Pending",
	Accepted = "Accepted",
	Declined = "Declined",
}

export interface ILeaveRequest extends Document {
	studentId: string;
	reason: string;
	status: LeaveStatus;
	timestamp: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
	studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	reason: { type: String, required: true },
	status: { type: String, enum: Object.values(LeaveStatus), required: true },
	timestamp: { type: Date, default: Date.now },
});

export const LeaveRequestModel = mongoose.model<ILeaveRequest>(
	"LeaveRequest",
	LeaveRequestSchema
);
