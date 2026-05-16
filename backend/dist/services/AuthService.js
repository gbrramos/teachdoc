"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = __importDefault(require("../database/connection"));
const user_1 = require("../types/user");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = (process.env.JWT_EXPIRATION || '7d');
class AuthService {
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            return null;
        }
    }
    static async getUsers() {
        const users = await connection_1.default.user.findMany({ select: { id: true, email: true, role: true } });
        return users.map((u) => ({ ...u, id: String(u.id), role: u.role }));
    }
    static async createUser(data) {
        const existing = await connection_1.default.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return { success: false, message: 'Email already in use' };
        }
        const hashed = await bcrypt_1.default.hash(data.password, 10);
        const user = await connection_1.default.user.create({
            data: { name: data.name, email: data.email, password: hashed },
        });
        return {
            success: true,
            message: 'User created successfully',
            user: { id: String(user.id), email: user.email, role: user.role },
        };
    }
    static async seedDefaultUser() {
        const DEFAULT_EMAIL = process.env.DEFAULT_USER_EMAIL || 'admin@teachdoc.com';
        const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'Admin@1234';
        const existing = await connection_1.default.user.findUnique({ where: { email: DEFAULT_EMAIL } });
        if (existing) {
            return { success: false, message: 'Default user already exists' };
        }
        const hashed = await bcrypt_1.default.hash(DEFAULT_PASSWORD, 10);
        await connection_1.default.user.create({ data: { email: DEFAULT_EMAIL, password: hashed, role: user_1.UserRoles.ADMIN, name: 'Admin' } });
        return { success: true, message: `Default user created: ${DEFAULT_EMAIL}` };
    }
    static async login(credentials) {
        try {
            const { email, password } = credentials;
            if (!email || !password) {
                return { success: false, message: 'Email and password are required' };
            }
            const user = await connection_1.default.user.findUnique({
                where: { email },
            });
            if (!user) {
                return { success: false, message: 'Invalid email or password' };
            }
            const passwordMatch = await bcrypt_1.default.compare(password, user.password);
            if (!passwordMatch) {
                return { success: false, message: 'Invalid email or password' };
            }
            const payload = { id: String(user.id), email: user.email };
            const token = this.generateToken(payload);
            return {
                success: true,
                message: 'Login successful',
                token,
                user: { id: payload.id, email: payload.email, role: user.role },
            };
        }
        catch (error) {
            return { success: false, message: 'An error occurred during login' };
        }
    }
}
exports.AuthService = AuthService;
