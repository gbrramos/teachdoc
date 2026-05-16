"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.listUsers = listUsers;
exports.seedDefaultUser = seedDefaultUser;
exports.getVersion = getVersion;
exports.login = login;
const AuthService_1 = require("../services/AuthService");
async function createUser(req, res) {
    try {
        const body = req.body;
        const response = await AuthService_1.AuthService.createUser(body);
        const status = response.success ? 201 : 409;
        res.status(status).json(response);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function listUsers(req, res) {
    try {
        const users = await AuthService_1.AuthService.getUsers();
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function seedDefaultUser(req, res) {
    try {
        const response = await AuthService_1.AuthService.seedDefaultUser();
        const status = response.success ? 201 : 409;
        res.status(status).json(response);
    }
    catch (error) {
        console.error('Error seeding default user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
function getVersion(req, res) {
    res.json({ version: '1.0.0' });
}
async function login(req, res) {
    try {
        const credentials = req.body;
        const response = await AuthService_1.AuthService.login(credentials);
        if (response.success) {
            res.status(200).json(response);
        }
        else {
            res.status(401).json(response);
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
