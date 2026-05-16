"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRooms = listRooms;
exports.getRoom = getRoom;
exports.createRoom = createRoom;
exports.updateRoom = updateRoom;
exports.deleteRoom = deleteRoom;
const RoomService_1 = require("../services/RoomService");
async function listRooms(req, res) {
    try {
        const rooms = await RoomService_1.RoomService.getRooms();
        res.status(200).json({ success: true, data: rooms });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
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
