import { Router } from 'express';
import {
  listDocumentsByRoom,
  listDocumentsByStudent,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/DocumentController';
import { authenticate } from '../middlewares/auth.middleware';

const documentRoutes = Router();

documentRoutes.get('/documents/:id', authenticate, getDocument);
documentRoutes.get('/rooms/:roomId/documents', authenticate, listDocumentsByRoom);
documentRoutes.get('/students/:studentId/documents', authenticate, listDocumentsByStudent);
documentRoutes.post('/documents', authenticate, createDocument);
documentRoutes.put('/documents/:id', authenticate, updateDocument);
documentRoutes.delete('/documents/:id', authenticate, deleteDocument);

export default documentRoutes;
