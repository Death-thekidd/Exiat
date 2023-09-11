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
exports.init = exports.Transaction = exports.initTransactionModel = exports.GatewayType = exports.CurrencyType = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const user_model_1 = require("./user.model");
var CurrencyType;
(function (CurrencyType) {
    CurrencyType["NGN"] = "NGN";
})(CurrencyType = exports.CurrencyType || (exports.CurrencyType = {}));
var GatewayType;
(function (GatewayType) {
    GatewayType["PAYSTACK"] = "paystack";
})(GatewayType = exports.GatewayType || (exports.GatewayType = {}));
const initTransactionModel = (sequelize) => {
    const Transaction = sequelize.define("Transaction", {
        UserID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: user_model_1.User,
                key: "id",
            },
        },
        transactionID: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        amount: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        currency: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            defaultValue: CurrencyType.NGN,
        },
        paymentStatus: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        paymentGateway: { type: sequelize_1.DataTypes.STRING, defaultValue: "paystack" },
    });
    return Transaction;
};
exports.initTransactionModel = initTransactionModel;
exports.Transaction = exports.initTransactionModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.Transaction.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=transaction.model.js.map