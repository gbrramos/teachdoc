"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const AuthService_1 = require("../services/AuthService");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    const payload = AuthService_1.AuthService.verifyToken(token);
    if (!payload) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
        return;
    }
    req.user = payload;
    next();
}
