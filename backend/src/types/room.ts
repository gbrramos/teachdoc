export interface CreateRoomRequest {
  name: string;
}

export interface UpdateRoomRequest {
  name: string;
}

export type RoomOwner = { id: number; name: string; email: string };
export type RoomData = { id: number; name: string; ownerId: number; createdAt: Date; updatedAt: Date; owner: RoomOwner };
export type RoomResult = { success: boolean; message: string; data?: RoomData };
