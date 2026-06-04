"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRooms = listRooms;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
exports.associateRoom = associateRoom;
const RoomService_1 = require("../services/RoomService");
const AuthService_1 = require("../services/AuthService");
async function listRooms(req, res) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
        const payload = token ? AuthService_1.AuthService.verifyToken(token) : req.user;
        const userId = Number(payload?.id);
        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(401).json({ success: false, message: 'Invalid user session' });
            return;
        }
        const rooms = await RoomService_1.RoomService.getRooms(userId);
        res.status(200).json({ success: true, data: rooms });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
}
async function getRoom(req, res) {
    try {
        const id = Number(req.params.id);
        const room = await RoomService_1.RoomService.getRoomById(id);
        if (!room) {
            res.status(404).json({ success: false, message: 'Room not found' });
            return;
        }
        res.status(200).json({ success: true, data: room });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function createRoom(req, res) {
    try {
        const ownerId = Number(req.user.id);
        const result = await RoomService_1.RoomService.createRoom(req.body, ownerId);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function updateRoom(req, res) {
    try {
        const id = Number(req.params.id);
        const requesterId = Number(req.user.id);
        const result = await RoomService_1.RoomService.updateRoom(id, req.body, requesterId);
        if (!result.success) {
            const status = result.message === 'Room not found' ? 404 : 403;
            res.status(status).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function deleteRoom(req, res) {
    try {
        const id = Number(req.params.id);
        const requesterId = Number(req.user.id);
        const result = await RoomService_1.RoomService.deleteRoom(id, requesterId);
        if (!result.success) {
            const status = result.message === 'Room not found' ? 404 : 403;
            res.status(status).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function associateRoom(req, res) {
    try {
        const userId = Number(req.params.userId);
        const roomId = Number(req.params.roomId);
        const roomName = typeof req.body?.name === 'string'
            ? req.body.name.trim()
            : typeof req.query.name === 'string'
                ? req.query.name.trim()
                : '';
        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(401).json({ success: false, message: 'Invalid user session' });
            return;
        }
        if (!Number.isInteger(roomId) || roomId <= 0 || !roomName) {
            res.status(400).json({ success: false, message: 'Room id and room name are required' });
            return;
        }
        const result = await RoomService_1.RoomService.associateRoom(roomId, roomName, userId);
        if (!result.success) {
            const status = result.message === 'Room not found' ? 404 : 409;
            res.status(status).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
