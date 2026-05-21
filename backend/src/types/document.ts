export interface CreateDocumentRequest {
  content: string;
  roomId: number;
}

export interface UpdateDocumentRequest {
  content: string;
}

export type DocumentStudent = { id: number; name: string; email: string };
export type DocumentRoom = { id: number; name: string };

export type DocumentData = {
  id: number;
  studentId: number;
  roomId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  student: DocumentStudent;
  room: DocumentRoom;
};

export type DocumentResult = { success: boolean; message: string; data?: DocumentData };
