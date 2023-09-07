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
const nodemailer_1 = __importDefault(require("nodemailer"));
const secrets_1 = require("./util/secrets");
const createTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp-relay.sendinblue.com",
        port: 465,
        auth: {
            user: secrets_1.SENDER_EMAIL,
            pass: secrets_1.SENDER_PASS,
        },
    });
    return transporter;
});
function sendMail(to, subject, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailOptions = {
            from: secrets_1.SENDER_EMAIL,
            to: to,
            subject: subject,
            text: text, // plain text body
        };
        console.log(mailOptions);
        try {
            // Get response from the createTransport
            const emailTransporter = yield createTransporter();
            // Send email
            yield new Promise((resolve, reject) => {
                emailTransporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        // failed block
                        console.log(error);
                        reject(error);
                    }
                    else {
                        // Success block
                        console.log("Email sent: " + info.response);
                        resolve(info);
                    }
                });
            });
        }
        catch (error) {
            return console.log(error);
        }
    });
}
exports.default = sendMail;
//# sourceMappingURL=sendMail.js.map