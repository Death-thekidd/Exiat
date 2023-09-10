import { body, check, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import async from "async";
import https from "https";
import { PAYSTACK_PUBLIC_KEY } from "../util/secrets";
import { Student } from "../models/student.model";

/**
 * Initialize Paystack payment gateway
 * @route POST /initialize-payment
 */
export const initializePayment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		// request body from the clients
		const { email, amount } = req.body;
		// params
		const params = JSON.stringify({
			email: email,
			amount: amount,
		});
		// options
		const options = {
			hostname: "api.paystack.co",
			port: 443,
			path: "/transaction/initialize",
			method: "POST",
			headers: {
				Authorization: PAYSTACK_PUBLIC_KEY,
				"Content-Type": "application/json",
			},
		};
		const clientReq = https
			.request(options, (apiRes) => {
				let data = "";
				apiRes.on("data", (chunk) => {
					data += chunk;
				});
				apiRes.on("end", () => {
					console.log(JSON.parse(data));
					return res.status(200).json(data);
				});
			})
			.on("error", (error: Error) => {
				console.error(error);
				res.status(500).json({ error: "An error occurred" }); // Send error response
			});
		clientReq.write(params);
		clientReq.end();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};
