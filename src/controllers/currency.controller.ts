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
			});
		clientReq.write(params);
		clientReq.end();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};

/**
 * Callback verification url
 * @route POST /verify-transaction
 */
export const verifyPayment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const options = {
			hostname: "api.paystack.co",
			port: 443,
			path: `/transaction/verify/:${req.body.reference}`,
			method: "GET",
			headers: {
				Authorization: PAYSTACK_PUBLIC_KEY,
				"Content-Type": "application/json",
			},
		};

		https
			.request(options, (apiRes) => {
				let data = "";
				apiRes.on("data", (chunk) => {
					data += chunk;
				});
				apiRes.on("end", async () => {
					console.log(JSON.parse(data));
					const transaction = JSON.parse(data);
					const {
						amount,
						reference,
						customer: { email },
					} = transaction;
					const student = await Student.findOne({ where: { email: email } });
					student.balance += amount / 1000;
					return res.status(200).json(data);
				});
			})
			.on("error", (error) => {
				console.error(error);
			});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "An error occurred" });
	}
};
