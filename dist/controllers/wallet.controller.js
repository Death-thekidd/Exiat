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
exports.updateWallet = exports.createWalletTransaction = exports.verifyPayment = exports.getWallet = exports.getWallets = void 0;
const wallet_model_1 = require("../models/wallet.model");
const walletTransaction_model_1 = require("../models/walletTransaction.model");
const transaction_model_1 = require("../models/transaction.model");
const secrets_1 = require("../util/secrets");
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
/**
 * Get all Wallets
 * @route GET /wallets
 */
const getWallets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallets = yield wallet_model_1.Wallet.findAll();
        return res.status(200).json({ data: wallets });
    }
    catch (error) {
        next(error);
    }
});
exports.getWallets = getWallets;
/**
 * Get Wallet by UserID
 * @route GET /wallet/:id
 */
const getWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = req.params.id;
        const wallet = yield wallet_model_1.Wallet.findOne({ where: { UserID: userID } });
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        return res.status(200).json({ data: wallet });
    }
    catch (error) {
        next(error);
    }
});
exports.getWallet = getWallet;
/**
 * Paystack webhook url
 * @route POST /verify-transaction
 */
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //validate event
    const hash = crypto_1.default
        .createHmac("sha512", secrets_1.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
        // Retrieve the request's body
        const event = req.body;
        // Do something with event
        if (event && event.event === "charge.success") {
            const { status, currency, id, amount, customer } = event.data;
            const transactionExist = yield transaction_model_1.Transaction.findOne({
                where: { transactionID: id },
            });
            if (transactionExist) {
                return res.status(409).send("Transaction Already Exist");
            }
            const user = yield user_model_1.User.findOne({ where: { email: customer.email } });
            const wallet = yield validateUserWallet(user.id);
            yield exports.createWalletTransaction(user.id, status, currency, amount, walletTransaction_model_1.TransactionType.DEPOSIT);
            yield createTransaction(user.id, id, status, currency, amount, customer);
            yield exports.updateWallet(user.id, amount);
            return res
                .status(200)
                .json({ message: "wallet funded successfully", data: wallet });
        }
    }
    res.send(200);
});
exports.verifyPayment = verifyPayment;
// Validating User wallet
const validateUserWallet = (UserID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // check if user have a wallet, else create wallet
        const userWallet = yield wallet_model_1.Wallet.findOne({ where: { UserID: UserID } });
        // If user wallet doesn't exist, create a new one
        if (!userWallet) {
            // create wallet
            const wallet = yield wallet_model_1.Wallet.create({
                UserID: UserID,
            });
            return wallet;
        }
        return userWallet;
    }
    catch (error) {
        console.log(error);
    }
});
// Create Wallet Transaction
const createWalletTransaction = (UserID, status, currency, amount, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // create wallet transaction
        const walletTransaction = yield walletTransaction_model_1.WalletTransaction.create({
            amount,
            UserID,
            currency,
            status,
            isInFlow: true,
            transactionType: type,
        });
        return walletTransaction;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createWalletTransaction = createWalletTransaction;
// Create Transaction
const createTransaction = (UserID, id, status, currency, amount, customer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // create transaction
        const transaction = yield transaction_model_1.Transaction.create({
            UserID,
            transactionID: id,
            name: customer.name,
            email: customer.email,
            amount,
            currency,
            paymentStatus: status,
            paymentGateway: transaction_model_1.GatewayType.PAYSTACK,
        });
        return transaction;
    }
    catch (error) {
        console.log(error);
    }
});
// Update wallet
const updateWallet = (UserID, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // update wallet
        const wallet = yield wallet_model_1.Wallet.findOne({
            where: { UserID },
        });
        wallet.balance += amount;
        wallet.save();
        return wallet;
    }
    catch (error) {
        console.log(error);
    }
});
exports.updateWallet = updateWallet;
//# sourceMappingURL=wallet.controller.js.map