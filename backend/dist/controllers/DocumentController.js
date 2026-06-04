"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocumentsByRoom = listDocumentsByRoom;
exports.listDocumentsByStudent = listDocumentsByStudent;
exports.getDocument = getDocument;
exports.createDocument = createDocument;
exports.updateDocument = updateDocument;
exports.deleteDocument = deleteDocument;
const DocumentService_1 = require("../services/DocumentService");
async function listDocumentsByRoom(req, res) {
    try {
        const roomId = Number(req.params.roomId);
        const documents = await DocumentService_1.DocumentService.getDocumentsByRoom(roomId);
        res.status(200).json({ success: true, data: documents });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function listDocumentsByStudent(req, res) {
    try {
        const studentId = Number(req.params.studentId);
        const documents = await DocumentService_1.DocumentService.getDocumentsByStudent(studentId);
        res.status(200).json({ success: true, data: documents });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function getDocument(req, res) {
    try {
        const id = Number(req.params.id);
        const document = await DocumentService_1.DocumentService.getDocumentById(id);
        if (!document) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }
        res.status(200).json({ success: true, data: document });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function createDocument(req, res) {
    try {
        const studentId = Number(req.user.id);
        const result = await DocumentService_1.DocumentService.createDocument(req.body, studentId);
        if (!result.success) {
            res.status(404).json(result);
            return;
        }
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function updateDocument(req, res) {
    try {
        const id = Number(req.params.id);
        const requesterId = Number(req.user.id);
        const result = await DocumentService_1.DocumentService.updateDocument(id, req.body, requesterId);
        if (!result.success) {
            const status = result.message === 'Document not found' ? 404 : 403;
            res.status(status).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
async function deleteDocument(req, res) {
    try {
        const id = Number(req.params.id);
        const requesterId = Number(req.user.id);
        const result = await DocumentService_1.DocumentService.deleteDocument(id, requesterId);
        if (!result.success) {
            const status = result.message === 'Document not found' ? 404 : 403;
            res.status(status).json(result);
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
