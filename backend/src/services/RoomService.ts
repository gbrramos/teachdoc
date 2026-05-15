import prisma from '../database/connection';
import { CreateRoomRequest, UpdateRoomRequest, RoomData, RoomResult } from '../types/room';

export class RoomService {
  static async getRooms(): Promise<RoomData[]> {
    return prisma.room.findMany({
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getRoomById(id: number): Promise<RoomData | null> {
    return prisma.room.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
  }

  static async createRoom(data: CreateRoomRequest, ownerId: number): Promise<RoomResult> {
    const room = await prisma.room.create({
      data: { name: data.name, ownerId },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return { success: true, message: 'Room created successfully', data: room };
  }

  static async updateRoom(id: number, data: UpdateRoomRequest, requesterId: number): Promise<RoomResult> {
    const room = await prisma.room.findUnique({ where: { id } });

    if (!room) return { success: false, message: 'Room not found' };
    if (room.ownerId !== requesterId) return { success: false, message: 'Forbidden' };

    const updated = await prisma.room.update({
      where: { id },
      data: { name: data.name },
      include: { owner: { select: { id: true, name: true, email: true } } },
    });

    return { success: true, message: 'Room updated successfully', data: updated };
  }

  static async deleteRoom(id: number, requesterId: number): Promise<{ success: boolean; message: string }> {
    const room = await prisma.room.findUnique({ where: { id } });

    if (!room) return { success: false, message: 'Room not found' };
    if (room.ownerId !== requesterId) return { success: false, message: 'Forbidden' };

    await prisma.room.delete({ where: { id } });
    return { success: true, message: 'Room deleted successfully' };
  }
}
