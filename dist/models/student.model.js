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
exports.init = exports.Student = exports.initStudentModel = exports.StudentType = void 0;
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../sequelize"));
const user_model_1 = require("./user.model");
// Define the UserType enum
var StudentType;
(function (StudentType) {
})(StudentType = exports.StudentType || (exports.StudentType = {}));
const initStudentModel = (sequelize) => {
    const Student = sequelize.define("Student", {
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
        },
        UserID: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: user_model_1.User,
                key: "id",
            },
        },
        username: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        email: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
        name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        guardianEmail: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        guardianPhone: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        guardianName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        balance: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    });
    return Student;
};
exports.initStudentModel = initStudentModel;
exports.Student = exports.initStudentModel(sequelize_2.default);
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.Student.sequelize.sync();
            // console.log("Database and tables synced successfully");
        }
        catch (error) {
            console.error("Error syncing database:", error);
        }
    });
}
exports.init = init;
//# sourceMappingURL=student.model.js.map