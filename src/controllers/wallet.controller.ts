import { Request, Response, NextFunction } from "express";
import { Wallet } from "../models/wallet.model";
import {
	CurrencyType,
	TransactionType,
	WalletTransaction,
} from "../models/walletTransaction.model";
import { GatewayType, Transaction } from "../models/transaction.model";
import { PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY } from "../util/secrets";
import crypto from "crypto";
import { User } from "../models/user.model";

/**
 * Get all Wallets
 * @route GET /wallets
 */
export const getWallets = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const wallets = await Wallet.findAll();
		return res.status(200).json({ data: wallets });
	} catch (error) {
		next(error);
	}
};

/**
 * Get Wallet by UserID
 * @route GET /wallet/:id
 */
export const getWallet = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const userID = req.params.id;
		const wallet = await Wallet.findOne({ where: { UserID: userID } });

		if (!wallet) {
			return res.status(404).json({ message: "Wallet not found" });
		}

		return res.status(200).json({ data: wallet });
	} catch (error) {
		next(error);
	}
};

/**
 * Paystack webhook url
 * @route POST /verify-transaction
 */
export const verifyPayment = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	//validate event
	const hash = crypto
		.createHmac("sha512", PAYSTACK_SECRET_KEY)
		.update(JSON.stringify(req.body))
		.digest("hex");

	if (hash == req.headers["x-paystack-signature"]) {
		// Retrieve the request's body
		const event = req.body;
		// Do something with event
		if (event && event.event === "charge.success") {
			const { status, currency, id, amount, customer } = event.data;
			const transactionExist = await Transaction.findOne({
				where: { transactionID: id },
			});

			if (transactionExist) {
				return res.status(409).send("Transaction Already Exist");
			}

			const user = await User.findOne({ where: { email: customer.email } });
			const wallet = await validateUserWallet(user.id);
			await createWalletTransaction(
				user.id,
				status,
				currency,
				amount,
				TransactionType.DEPOSIT
			);
			await createTransaction(user.id, id, status, currency, amount, customer);

			await updateWallet(user.id, amount);
			return res
				.status(200)
				.json({ message: "wallet funded successfully", data: wallet });
		}
	}

	res.send(200);
};

// Validating User wallet
const validateUserWallet = async (UserID: string) => {
	try {
		// check if user have a wallet, else create wallet
		const userWallet = await Wallet.findOne({ where: { UserID: UserID } });

		// If user wallet doesn't exist, create a new one
		if (!userWallet) {
			// create wallet
			const wallet = await Wallet.create({
				UserID: UserID,
			});
			return wallet;
		}
		return userWallet;
	} catch (error) {
		console.log(error);
	}
};

// Create Wallet Transaction
export const createWalletTransaction = async (
	UserID: string,
	status: string,
	currency: CurrencyType,
	amount: number,
	type: TransactionType
) => {
	try {
		// create wallet transaction
		const walletTransaction = await WalletTransaction.create({
			amount,
			UserID,
			currency,
			status,
			isInFlow: true,
			transactionType: type,
		});
		return walletTransaction;
	} catch (error) {
		console.log(error);
	}
};

// Create Transaction
const createTransaction = async (
	UserID: string,
	id: number,
	status: string,
	currency: CurrencyType,
	amount: number,
	customer: {
		name: string;
		email: string;
	}
) => {
	try {
		// create transaction
		const transaction = await Transaction.create({
			UserID,
			transactionID: id,
			name: customer.name,
			email: customer.email,
			amount,
			currency,
			paymentStatus: status,
			paymentGateway: GatewayType.PAYSTACK,
		});
		return transaction;
	} catch (error) {
		console.log(error);
	}
};

// Update wallet
export const updateWallet = async (UserID: string, amount: number) => {
	try {
		// update wallet
		const wallet = await Wallet.findOne({
			where: { UserID },
		});
		wallet.balance += amount;
		wallet.save();
		return wallet;
	} catch (error) {
		console.log(error);
	}
};
