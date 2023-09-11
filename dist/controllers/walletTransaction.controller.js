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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletTransaction = exports.getWalletTransactions = void 0;
const walletTransaction_model_1 = require("../models/walletTransaction.model");
/**
 * Get all WalletTransactions
 * @route GET /wallet-transactions
 */
const getWalletTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletTransactions = yield walletTransaction_model_1.WalletTransaction.findAll();
        return res.status(200).json({ data: walletTransactions });
    }
    catch (error) {
        next(error);
    }
});
exports.getWalletTransactions = getWalletTransactions;
/**
 * Get Wallet Transaction by id
 * @route GET /wallet-transaction/:id
 */
const getWalletTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const wallet = yield walletTransaction_model_1.WalletTransaction.findByPk(id);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        return res.status(200).json({ data: wallet });
    }
    catch (error) {
        next(error);
    }
});
exports.getWalletTransaction = getWalletTransaction;
//# sourceMappingURL=walletTransaction.controller.js.map