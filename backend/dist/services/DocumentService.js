"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const connection_1 = __importDefault(require("../database/connection"));
const TEACHER_ALLOWED_STATUSES = new Set(['PENDING', 'APPROVED', 'CHANGES_REQUESTED']);
const STUDENT_ALLOWED_STATUSES = new Set(['DRAFT', 'PENDING']);
const documentInclude = {
    student: { select: { id: true, name: true, email: true } },
    room: { select: { id: true, name: true } },
};
function toDocumentData(document) {
    return {
        ...document,
        status: typeof document?.status === 'string' ? document.status : 'PENDING',
        teacherNotes: document?.teacherNotes ?? null,
    };
}
class DocumentService {
    static async getDocumentsByRoom(roomId) {
        const documents = await connection_1.default.document.findMany({
            where: { roomId },
            include: documentInclude,
            orderBy: { createdAt: 'desc' },
        });
        return documents.map(toDocumentData);
    }
    static async getDocumentsByStudent(studentId) {
        const documents = await connection_1.default.document.findMany({
            where: { studentId },
            include: documentInclude,
            orderBy: { createdAt: 'desc' },
        });
        return documents.map(toDocumentData);
    }
    static async getDocumentById(id) {
        const document = await connection_1.default.document.findUnique({
            where: { id },
            include: documentInclude,
        });
        return document ? toDocumentData(document) : null;
    }
    static async createDocument(data, studentId) {
        const room = await connection_1.default.room.findUnique({ where: { id: data.roomId } });
        if (!room)
            return { success: false, message: 'Room not found' };
        if (room.ownerId === studentId) {
            return { success: false, message: 'Only students can create documents' };
        }
        const enrollment = await connection_1.default.roomStudent.findUnique({
            where: { userId_roomId: { userId: studentId, roomId: data.roomId } },
        });
        if (!enrollment) {
            return { success: false, message: 'Student is not associated with this room' };
        }
        if (!data.content || !data.content.trim()) {
            return { success: false, message: 'Document content is required' };
        }
        const initialStatus = (data.status ?? 'DRAFT');
        if (!STUDENT_ALLOWED_STATUSES.has(initialStatus)) {
            return { success: false, message: 'Invalid document status' };
        }
        const document = await connection_1.default.document.create({
            data: {
                content: data.content.trim(),
                roomId: data.roomId,
                studentId,
                status: initialStatus,
            },
            include: documentInclude,
        });
        return { success: true, message: 'Document created successfully', data: toDocumentData(document) };
    }
    static async updateDocument(id, data, requesterId) {
        const document = await connection_1.default.document.findUnique({
            where: { id },
            include: { room: { select: { ownerId: true } } },
        });
        if (!document)
            return { success: false, message: 'Document not found' };
        if (document.studentId === requesterId) {
            if (data.status && !STUDENT_ALLOWED_STATUSES.has(data.status)) {
                return { success: false, message: 'Invalid document status' };
            }
            const nextContent = data.content?.trim();
            const nextStatus = data.status ?? (nextContent ? 'DRAFT' : undefined);
            if (!nextContent && !nextStatus) {
                return { success: false, message: 'No update fields provided' };
            }
            if (nextStatus === 'PENDING' && !(nextContent || document.content?.trim())) {
                return { success: false, message: 'Document content is required' };
            }
            const updatedByStudent = await connection_1.default.document.update({
                where: { id },
                data: {
                    ...(nextContent ? { content: nextContent } : {}),
                    ...(nextStatus ? { status: nextStatus } : {}),
                    ...(nextStatus === 'PENDING' ? { teacherNotes: null } : {}),
                },
                include: documentInclude,
            });
            return { success: true, message: 'Document updated successfully', data: toDocumentData(updatedByStudent) };
        }
        if (document.room.ownerId !== requesterId)
            return { success: false, message: 'Forbidden' };
        if (document.status === 'APPROVED') {
            return { success: false, message: 'Approved documents cannot be changed' };
        }
        if (data.status && !TEACHER_ALLOWED_STATUSES.has(data.status)) {
            return { success: false, message: 'Invalid document status' };
        }
        const reviewData = {
            ...(data.status ? { status: data.status } : {}),
            ...(data.teacherNotes !== undefined ? { teacherNotes: data.teacherNotes?.trim() || null } : {}),
        };
        if (Object.keys(reviewData).length === 0) {
            return { success: false, message: 'No review fields provided' };
        }
        const updated = await connection_1.default.document.update({
            where: { id },
            data: reviewData,
            include: documentInclude,
        });
        return { success: true, message: 'Document reviewed successfully', data: toDocumentData(updated) };
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
