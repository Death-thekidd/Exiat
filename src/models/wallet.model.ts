import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../sequelize";
import { User } from "./user.model";

export interface WalletDocument {
	balance: number;
	UserID: string;
}

export interface WalletInstance extends Model<WalletDocument>, WalletDocument {}

export const initWalletModel = (sequelize: Sequelize) => {
	const Wallet = sequelize.define<WalletInstance>("Wallet", {
		UserID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
		},
		balance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
	});

	return Wallet;
};

export const Wallet = initWalletModel(sequelize);

export async function init() {
	try {
		await Wallet.sequelize.sync();
		// console.log("Database and tables synced successfully");
	} catch (error) {
		console.error("Error syncing database:", error);
	}
}
