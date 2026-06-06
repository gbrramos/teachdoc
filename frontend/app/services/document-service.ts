import api from "./api";

export type DocumentStatus = "DRAFT" | "PENDING" | "APPROVED" | "CHANGES_REQUESTED";

export interface DocumentStudent {
  id: number;
  name: string;
  email: string;
}

export interface DocumentRoom {
  id: number;
  name: string;
}

export interface Document {
  id: number;
  studentId: number;
  roomId: number;
  content: string;
  status: DocumentStatus;
  teacherNotes: string | null;
  createdAt: string;
  updatedAt: string;
  student: DocumentStudent;
  room: DocumentRoom;
}

export async function getDocumentsByRoom(roomId: number): Promise<Document[]> {
  const response = await api.get<{ success: boolean; data: Document[] }>(`/rooms/${roomId}/documents`);
  return response.data;
}

export async function createDocument(roomId: number, content: string, status: "DRAFT" | "PENDING" = "DRAFT"): Promise<Document> {
  const response = await api.post<{ success: boolean; message: string; data: Document }>("/documents", {
    roomId,
    content,
    status,
  });
  return response.data;
}

export async function updateDocument(documentId: number, content: string): Promise<Document> {
  const response = await api.put<{ success: boolean; message: string; data: Document }>(`/documents/${documentId}`, {
    content,
    status: "DRAFT",
  });
  return response.data;
}

export async function submitDocument(documentId: number): Promise<Document> {
  const response = await api.put<{ success: boolean; message: string; data: Document }>(`/documents/${documentId}`, {
    status: "PENDING",
  });
  return response.data;
}

export async function reviewDocument(documentId: number, status: DocumentStatus, teacherNotes: string): Promise<Document> {
  const response = await api.put<{ success: boolean; message: string; data: Document }>(`/documents/${documentId}`, {
    status,
    teacherNotes,
  });
  return response.data;
}

