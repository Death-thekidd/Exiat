import { Request, Response, NextFunction } from "express";
import { Transaction } from "../models/transaction.model";

/**
 * Get all WalletTransactions
 * @route GET /transactions
 */
export const getTransactions = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const Transactions = await Transaction.findAll();
		return res.status(200).json({ data: Transactions });
	} catch (error) {
		next(error);
	}
};

/**
 * Get Transaction by transaction ID
 * @route GET /transaction/:id
 */
export const getTransaction = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const id = req.params.id;
		const transaction = await Transaction.findByPk(id);

		if (!transaction) {
			return res.status(404).json({ message: "Transaction not found" });
		}

		return res.status(200).json({ data: transaction });
	} catch (error) {
		next(error);
	}
};
