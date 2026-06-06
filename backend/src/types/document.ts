export interface CreateDocumentRequest {
  content: string;
  roomId: number;
  status?: DocumentStatus;
}

export type DocumentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

export interface UpdateDocumentRequest {
  content?: string;
  status?: DocumentStatus;
  teacherNotes?: string | null;
}

export type DocumentStudent = { id: number; name: string; email: string };
export type DocumentRoom = { id: number; name: string };

export type DocumentData = {
  id: number;
  studentId: number;
  roomId: number;
  content: string;
  status: string;
  teacherNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: DocumentStudent;
  room: DocumentRoom;
};

export type DocumentResult = { success: boolean; message: string; data?: DocumentData };
