import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../sequelize";
import { User } from "./user.model";

export enum CurrencyType {
	NGN = "NGN",
}

export enum GatewayType {
	PAYSTACK = "paystack",
}

export interface TransactionDocument {
	UserID: string;
	transactionID: number;
	name: string;
	email: string;
	amount: number;
	currency: CurrencyType;
	paymentStatus: string;
	paymentGateway: GatewayType;
}

export interface TransactionInstance
	extends Model<TransactionDocument>,
		TransactionDocument {}

export const initTransactionModel = (sequelize: Sequelize) => {
	const Transaction = sequelize.define<TransactionInstance>("Transaction", {
		UserID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
		transactionID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
		},
		name: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false },
		amount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: CurrencyType.NGN,
		},
		paymentStatus: { type: DataTypes.STRING, allowNull: false },
		paymentGateway: { type: DataTypes.STRING, defaultValue: "paystack" },
	});

	return Transaction;
};

export const Transaction = initTransactionModel(sequelize);

export async function init() {
	try {
		await Transaction.sequelize.sync();
		// console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
