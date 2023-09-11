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
exports.getTransaction = exports.getTransactions = void 0;
const transaction_model_1 = require("../models/transaction.model");
/**
 * Get all WalletTransactions
 * @route GET /transactions
 */
const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Transactions = yield transaction_model_1.Transaction.findAll();
        return res.status(200).json({ data: Transactions });
    }
    catch (error) {
        next(error);
    }
});
exports.getTransactions = getTransactions;
/**
 * Get Transaction by transaction ID
 * @route GET /transaction/:id
 */
const getTransaction = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const transaction = yield transaction_model_1.Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        return res.status(200).json({ data: transaction });
    }
    catch (error) {
        next(error);
    }
});
exports.getTransaction = getTransaction;
//# sourceMappingURL=transaction.controller.js.map