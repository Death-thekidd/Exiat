import nodemailer from "nodemailer";
import { SENDER_EMAIL, SENDER_PASS } from "./util/secrets";

const createTransporter = async () => {
	const transporter = nodemailer.createTransport({
		host: "smtp-relay.sendinblue.com",
		port: 465,
		auth: {
			user: SENDER_EMAIL,
			pass: SENDER_PASS,
		},
	});

	return transporter;
};

async function sendMail(to: string[], subject: string, text: string) {
	const mailOptions = {
		from: SENDER_EMAIL, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		text: text, // plain text body
	};

	console.log(mailOptions);

	try {
		// Get response from the createTransport
		const emailTransporter = await createTransporter();

		// Send email
		await new Promise((resolve, reject) => {
			emailTransporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					// failed block
					console.log(error);
					reject(error);
				} else {
					// Success block
					console.log("Email sent: " + info.response);
					resolve(info);
				}
			});
		});
	} catch (error) {
		return console.log(error);
	}
}

export default sendMail;
