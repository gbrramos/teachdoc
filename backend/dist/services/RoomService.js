"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const connection_1 = __importDefault(require("../database/connection"));
class RoomService {
    static async getRooms(userId) {
        return connection_1.default.room.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { students: { some: { userId } } },
                ],
            },
            include: { owner: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getRoomById(id) {
        return connection_1.default.room.findUnique({
            where: { id },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
    }
    static async createRoom(data, ownerId) {
        const room = await connection_1.default.room.create({
            data: { name: data.name, ownerId },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        return { success: true, message: 'Room created successfully', data: room };
    }
    static async updateRoom(id, data, requesterId) {
        const room = await connection_1.default.room.findUnique({ where: { id } });
        if (!room)
            return { success: false, message: 'Room not found' };
        if (room.ownerId !== requesterId)
            return { success: false, message: 'Forbidden' };
        const updated = await connection_1.default.room.update({
            where: { id },
            data: { name: data.name },
            include: { owner: { select: { id: true, name: true, email: true } } },
        });
        return { success: true, message: 'Room updated successfully', data: updated };
    }
    static async deleteRoom(id, requesterId) {
        const room = await connection_1.default.room.findUnique({ where: { id } });
        if (!room)
            return { success: false, message: 'Room not found' };
        if (room.ownerId !== requesterId)
            return { success: false, message: 'Forbidden' };
        await connection_1.default.room.delete({ where: { id } });
        return { success: true, message: 'Room deleted successfully' };
    }
    static async associateRoom(id, userId) {
        const room = await connection_1.default.room.findFirst({ where: { id } });
        if (!room)
            return { success: false, message: 'Room not found' };
        const existingAssociation = await connection_1.default.roomStudent.findUnique({
            where: { userId_roomId: { userId, roomId: id } },
        });
        if (existingAssociation) {
            return { success: false, message: 'User is already associated with this room' };
        }
        await connection_1.default.roomStudent.create({
            data: { userId, roomId: id },
        });
        return { success: true, message: 'User associated with room successfully' };
    }
}
exports.RoomService = RoomService;
