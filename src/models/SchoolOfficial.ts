import mongoose, { Document, Schema } from "mongoose";

interface ISchoolOfficial extends Document {
	name: string;
	role: string;
	contactDetails: string;
}

const SchoolOfficialSchema = new Schema<ISchoolOfficial>({
	name: { type: String, required: true },
	role: { type: String, required: true },
	contactDetails: { type: String, required: true },
});

export const SchoolOfficialModel = mongoose.model<ISchoolOfficial>(
	"SchoolOfficial",
	SchoolOfficialSchema
);
