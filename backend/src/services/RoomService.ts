import prisma from '../database/connection';
import { CreateRoomRequest, RoomData, RoomResult } from '../types/room';

export class RoomService {
  static async getRooms(userId: number): Promise<RoomData[]> {
    return prisma.room.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { students: { some: { userId } } },
        ],
      },
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

  static async updateRoom(id: number, data: CreateRoomRequest, requesterId: number): Promise<RoomResult> {
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

  static async associateRoom(id: number, userId: number): Promise<{ success: boolean; message: string }> {
    const room = await prisma.room.findFirst({ where: { id } });
    if (!room) return { success: false, message: 'Room not found' };

    const existingAssociation = await prisma.roomStudent.findUnique({
      where: { userId_roomId: { userId, roomId: id } },
    });

    if (existingAssociation) {
      return { success: false, message: 'User is already associated with this room' };
    }

    await prisma.roomStudent.create({
      data: { userId, roomId: id },
    });

    return { success: true, message: 'User associated with room successfully' };
  }
}
