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
exports.init = exports.Staff = exports.initStaffModel = exports.StaffType = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const user_model_1 = require("./user.model");
// Define the UserType enum
var StaffType;
(function (StaffType) {
    StaffType["DOS"] = "Dean of Student";
    StaffType["CSO"] = "Chief of Security";
    StaffType["CA"] = "Course Advisor";
    StaffType["AOD"] = "Assistant fo Dean";
})(StaffType = exports.StaffType || (exports.StaffType = {}));
const initStaffModel = (sequelize) => {
    const Staff = sequelize.define("Staff", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
        },
        username: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
        name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        UserID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: user_model_1.User,
                key: "id",
            },
        },
        staffType: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    });
    return Staff;
};
exports.initStaffModel = initStaffModel;
exports.Staff = exports.initStaffModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.Staff.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=staff.model.js.map