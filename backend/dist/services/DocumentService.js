"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const connection_1 = __importDefault(require("../database/connection"));
const documentInclude = {
    student: { select: { id: true, name: true, email: true } },
    room: { select: { id: true, name: true } },
};
class DocumentService {
    static async getDocumentsByRoom(roomId) {
        return connection_1.default.document.findMany({
            where: { roomId },
            include: documentInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getDocumentsByStudent(studentId) {
        return connection_1.default.document.findMany({
            where: { studentId },
            include: documentInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getDocumentById(id) {
        return connection_1.default.document.findUnique({
            where: { id },
            include: documentInclude,
        });
    }
    static async createDocument(data, studentId) {
        const room = await connection_1.default.room.findUnique({ where: { id: data.roomId } });
        if (!room)
            return { success: false, message: 'Room not found' };
        const document = await connection_1.default.document.create({
            data: { content: data.content, roomId: data.roomId, studentId },
            include: documentInclude,
        });
        return { success: true, message: 'Document created successfully', data: document };
    }
    static async updateDocument(id, data, requesterId) {
        const document = await connection_1.default.document.findUnique({ where: { id } });
        if (!document)
            return { success: false, message: 'Document not found' };
        if (document.studentId !== requesterId)
            return { success: false, message: 'Forbidden' };
        const updated = await connection_1.default.document.update({
            where: { id },
            data: { content: data.content },
            include: documentInclude,
        });
        return { success: true, message: 'Document updated successfully', data: updated };
    }
    static async deleteDocument(id, requesterId) {
        const document = await connection_1.default.document.findUnique({ where: { id } });
        if (!document)
            return { success: false, message: 'Document not found' };
        if (document.studentId !== requesterId)
            return { success: false, message: 'Forbidden' };
        await connection_1.default.document.delete({ where: { id } });
        return { success: true, message: 'Document deleted successfully' };
    }
}
exports.DocumentService = DocumentService;
