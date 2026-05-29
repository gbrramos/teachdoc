import api from "./api";

export interface RoomOwner {
    id: number;
    name: string;
    email: string;
}

export interface Room {
    id: number;
    name: string;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
    owner: RoomOwner;
}

export async function getRooms(): Promise<Room[]> {
    const response = await api.get<{ success: boolean; data: Room[] }>('/rooms');
    return response.data;
}

export async function createRoom(name: string): Promise<Room> {
    const result = await api.post<{ success: boolean; message: string; data: Room }>('/rooms', { name });
    return result.data;
}

export async function deleteRoom(id: number): Promise<void> {
    await api.delete(`/rooms/${id}`);
}
