import mongoose, { Document, Schema } from "mongoose";

interface IGuardianContact extends Document {
	userId: string;
	email: string;
	phoneNumber: string;
	name: string;
}

const GuardianContactSchema = new Schema<IGuardianContact>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	email: { type: String, required: true },
	phoneNumber: { type: String },
	name: { type: String, required: true },
});

export const GuardianContactModel = mongoose.model<IGuardianContact>(
	"GuardianContact",
	GuardianContactSchema
);
