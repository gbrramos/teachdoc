import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';

export async function listDocumentsByRoom(req: Request, res: Response) {
  try {
    const roomId = Number(req.params.roomId);
    const documents = await DocumentService.getDocumentsByRoom(roomId);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function listDocumentsByStudent(req: Request, res: Response) {
  try {
    const studentId = Number(req.params.studentId);
    const documents = await DocumentService.getDocumentsByStudent(studentId);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getDocument(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const document = await DocumentService.getDocumentById(id);

    if (!document) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function createDocument(req: Request & { user?: any }, res: Response) {
  try {
    const studentId = Number(req.user.id);
    const result = await DocumentService.createDocument(req.body, studentId);

    if (!result.success) {
      const status = result.message === 'Room not found'
        ? 404
        : result.message === 'Document content is required'
          ? 400
          : 403;
      res.status(status).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateDocument(req: Request & { user?: any }, res: Response) {
  try {
    const id = Number(req.params.id);
    const requesterId = Number(req.user.id);
    const result = await DocumentService.updateDocument(id, req.body, requesterId);

    if (!result.success) {
      const status = result.message === 'Document not found'
        ? 404
        : result.message === 'Approved documents cannot be changed'
          ? 409
        : result.message === 'Invalid document status' || result.message === 'No review fields provided' || result.message === 'No update fields provided' || result.message === 'Document content is required'
          ? 400
          : 403;
      res.status(status).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteDocument(req: Request & { user?: any }, res: Response) {
  try {
    const id = Number(req.params.id);
    const requesterId = Number(req.user.id);
    const result = await DocumentService.deleteDocument(id, requesterId);

    if (!result.success) {
      const status = result.message === 'Document not found' ? 404 : 403;
      res.status(status).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
