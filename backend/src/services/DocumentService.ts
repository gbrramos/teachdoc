import prisma from '../database/connection';
import { CreateDocumentRequest, UpdateDocumentRequest, DocumentData, DocumentResult } from '../types/document';

const documentInclude = {
  student: { select: { id: true, name: true, email: true } },
  room: { select: { id: true, name: true } },
};

export class DocumentService {
  static async getDocumentsByRoom(roomId: number): Promise<DocumentData[]> {
    return prisma.document.findMany({
      where: { roomId },
      include: documentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDocumentsByStudent(studentId: number): Promise<DocumentData[]> {
    return prisma.document.findMany({
      where: { studentId },
      include: documentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getDocumentById(id: number): Promise<DocumentData | null> {
    return prisma.document.findUnique({
      where: { id },
      include: documentInclude,
    });
  }

  static async createDocument(data: CreateDocumentRequest, studentId: number): Promise<DocumentResult> {
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) return { success: false, message: 'Room not found' };

    const document = await prisma.document.create({
      data: { content: data.content, roomId: data.roomId, studentId },
      include: documentInclude,
    });

    return { success: true, message: 'Document created successfully', data: document };
  }

  static async updateDocument(id: number, data: UpdateDocumentRequest, requesterId: number): Promise<DocumentResult> {
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) return { success: false, message: 'Document not found' };
    if (document.studentId !== requesterId) return { success: false, message: 'Forbidden' };

    const updated = await prisma.document.update({
      where: { id },
      data: { content: data.content },
      include: documentInclude,
    });

    return { success: true, message: 'Document updated successfully', data: updated };
  }

  static async deleteDocument(id: number, requesterId: number): Promise<{ success: boolean; message: string }> {
    const document = await prisma.document.findUnique({ where: { id } });

    if (!document) return { success: false, message: 'Document not found' };
    if (document.studentId !== requesterId) return { success: false, message: 'Forbidden' };

    await prisma.document.delete({ where: { id } });
    return { success: true, message: 'Document deleted successfully' };
  }
}
