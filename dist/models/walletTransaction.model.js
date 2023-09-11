"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.WalletTransaction = exports.initWalletTransactionModel = exports.TransactionType = exports.CurrencyType = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const user_model_1 = require("./user.model");
var CurrencyType;
(function (CurrencyType) {
    CurrencyType["NGN"] = "NGN";
})(CurrencyType = exports.CurrencyType || (exports.CurrencyType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["PAYMENT"] = "payment";
})(TransactionType = exports.TransactionType || (exports.TransactionType = {}));
const initWalletTransactionModel = (sequelize) => {
    const WalletTransaction = sequelize.define("WalletTransaction", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
        },
        amount: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        UserID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: user_model_1.User,
                key: "id",
            },
        },
        isInFlow: { type: sequelize_1.DataTypes.BOOLEAN },
        paymentMethod: { type: sequelize_1.DataTypes.STRING, defaultValue: "paystack" },
        currency: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        status: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        transactionType: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
    });
    return WalletTransaction;
};
exports.initWalletTransactionModel = initWalletTransactionModel;
exports.WalletTransaction = exports.initWalletTransactionModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.WalletTransaction.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=walletTransaction.model.js.map