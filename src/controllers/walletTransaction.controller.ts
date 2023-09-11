import { Request, Response, NextFunction } from "express";
import { WalletTransaction } from "../models/walletTransaction.model";

/**
 * Get all WalletTransactions
 * @route GET /wallet-transactions
 */
export const getWalletTransactions = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const walletTransactions = await WalletTransaction.findAll();
		return res.status(200).json({ data: walletTransactions });
	} catch (error) {
		next(error);
	}
};

/**
 * Get Wallet Transaction by id
 * @route GET /wallet-transaction/:id
 */
export const getWalletTransaction = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response<any, Record<string, any>>> => {
	try {
		const id = req.params.id;
		const wallet = await WalletTransaction.findByPk(id);

		if (!wallet) {
			return res.status(404).json({ message: "Wallet not found" });
		}

		return res.status(200).json({ data: wallet });
	} catch (error) {
		next(error);
	}
};
