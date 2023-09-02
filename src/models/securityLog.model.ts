import mongoose, { Document, Schema } from "mongoose";

enum SecurityAction {
	Acknowledgment = "Acknowledgment",
	Alert = "Alert",
}

interface ISecurityLog extends Document {
	studentId: string;
	actionType: SecurityAction;
	timestamp: Date;
	description: string;
}

const SecurityLogSchema = new Schema<ISecurityLog>({
	studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	actionType: {
		type: String,
		enum: Object.values(SecurityAction),
		required: true,
	},
	timestamp: { type: Date, default: Date.now },
	description: { type: String, required: true },
});

export const SecurityLogModel = mongoose.model<ISecurityLog>(
	"SecurityLog",
	SecurityLogSchema
);
