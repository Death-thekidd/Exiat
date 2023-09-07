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
exports.verifyPayment = exports.initializePayment = void 0;
const https_1 = __importDefault(require("https"));
const secrets_1 = require("../util/secrets");
const student_model_1 = require("../models/student.model");
/**
 * Initialize Paystack payment gateway
 * @route POST /initialize-payment
 */
const initializePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // request body from the clients
        const { email, amount } = req.body;
        // params
        const params = JSON.stringify({
            email: email,
            amount: amount,
        });
        // options
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: "/transaction/initialize",
            method: "POST",
            headers: {
                Authorization: secrets_1.PAYSTACK_PUBLIC_KEY,
                "Content-Type": "application/json",
            },
        };
        const clientReq = https_1.default
            .request(options, (apiRes) => {
            let data = "";
            apiRes.on("data", (chunk) => {
                data += chunk;
            });
            apiRes.on("end", () => {
                console.log(JSON.parse(data));
                return res.status(200).json(data);
            });
        })
            .on("error", (error) => {
            console.error(error);
        });
        clientReq.write(params);
        clientReq.end();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred" });
    }
});
exports.initializePayment = initializePayment;
/**
 * Callback verification url
 * @route POST /verify-transaction
 */
const verifyPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            hostname: "api.paystack.co",
            port: 443,
            path: `/transaction/verify/:${req.body.reference}`,
            method: "GET",
            headers: {
                Authorization: secrets_1.PAYSTACK_PUBLIC_KEY,
                "Content-Type": "application/json",
            },
        };
        https_1.default
            .request(options, (apiRes) => {
            let data = "";
            apiRes.on("data", (chunk) => {
                data += chunk;
            });
            apiRes.on("end", () => __awaiter(void 0, void 0, void 0, function* () {
                console.log(JSON.parse(data));
                const transaction = JSON.parse(data);
                const { amount, reference, customer: { email }, } = transaction;
                const student = yield student_model_1.Student.findOne({ where: { email: email } });
                student.balance += amount / 1000;
                return res.status(200).json(data);
            }));
        })
            .on("error", (error) => {
            console.error(error);
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred" });
    }
});
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=currency.controller.js.map