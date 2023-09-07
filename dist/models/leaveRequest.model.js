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
exports.init = exports.LeaveRequest = exports.initLeaveRequestModel = exports.StaffType = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const student_model_1 = require("./student.model");
const staff_model_1 = require("./staff.model");
// Define the UserType enum
var StaffType;
(function (StaffType) {
    StaffType["DOS"] = "Dean of Student";
    StaffType["CSO"] = "Chief of Security";
    StaffType["CA"] = "Course Advisor";
    StaffType["AOD"] = "Assistant fo Dean";
})(StaffType = exports.StaffType || (exports.StaffType = {}));
const initLeaveRequestModel = (sequelize) => {
    const LeaveRequest = sequelize.define("LeaveRequest", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
        },
        reason: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        departureDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        returnDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
        isApproved: { type: sequelize_1.DataTypes.BOOLEAN },
        isRejected: { type: sequelize_1.DataTypes.BOOLEAN },
        isCheckedIn: { type: sequelize_1.DataTypes.BOOLEAN },
        isCheckedOut: { type: sequelize_1.DataTypes.BOOLEAN },
        isFinePaid: { type: sequelize_1.DataTypes.BOOLEAN },
        StudentID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: student_model_1.Student,
                key: "id",
            },
        },
        StaffID: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: staff_model_1.Staff,
                key: "id",
            },
        },
    });
    return LeaveRequest;
};
exports.initLeaveRequestModel = initLeaveRequestModel;
exports.LeaveRequest = exports.initLeaveRequestModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.LeaveRequest.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=leaveRequest.model.js.map