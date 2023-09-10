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
exports.init = exports.Wallet = exports.initWalletModel = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const user_model_1 = require("./user.model");
const initWalletModel = (sequelize) => {
    const Wallet = sequelize.define("Wallet", {
        UserID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: user_model_1.User,
                key: "id",
            },
        },
        balance: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    });
    return Wallet;
};
exports.initWalletModel = initWalletModel;
exports.Wallet = exports.initWalletModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.Wallet.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=wallet.model.js.map