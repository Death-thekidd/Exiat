import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../sequelize";
import { User } from "./user.model";

export enum CurrencyType {
	NGN = "NGN",
}

export enum TransactionType {
	DEPOSIT = "deposit",
	PAYMENT = "payment",
}

export interface WalletTransactionDocument {
    id: string;
	amount: number;
	UserID: string;
	isInFlow: boolean;
	paymentMethod: string;
	currency: CurrencyType;
	status: string;
	transactionType: TransactionType;
}

export interface WalletTransactionInstance
	extends Model<WalletTransactionDocument>,
		WalletTransactionDocument {}

export const initWalletTransactionModel = (sequelize: Sequelize) => {
	const WalletTransaction = sequelize.define<WalletTransactionInstance>(
		"WalletTransaction",
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				autoIncrement: false,
				primaryKey: true,
			},
			amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
			UserID: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: User,
					key: "id",
				},
			},
			isInFlow: { type: DataTypes.BOOLEAN },
			paymentMethod: { type: DataTypes.STRING, defaultValue: "paystack" },
			currency: { type: DataTypes.STRING, allowNull: false },
			status: { type: DataTypes.STRING, allowNull: false },
			transactionType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		}
	);

	return WalletTransaction;
};

export const WalletTransaction = initWalletTransactionModel(sequelize);

export async function init() {
	try {
		await WalletTransaction.sequelize.sync();
		// console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
