import mongoose, { Document, Schema } from "mongoose";

enum NotificationStatus {
	Unread = "Unread",
	Read = "Read",
}

interface INotification extends Document {
	recipientId: string;
	message: string;
	timestamp: Date;
	status: NotificationStatus;
}

const NotificationSchema = new Schema<INotification>({
	recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	message: { type: String, required: true },
	timestamp: { type: Date, default: Date.now },
	status: {
		type: String,
		enum: Object.values(NotificationStatus),
		required: true,
	},
});

export const NotificationModel = mongoose.model<INotification>(
	"Notification",
	NotificationSchema
);
