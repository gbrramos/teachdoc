import { Request, Response } from 'express';
import { RoomService } from '../services/RoomService';

export async function listRooms(req: Request, res: Response) {
  try {
    const rooms = await RoomService.getRooms();
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function getRoom(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const room = await RoomService.getRoomById(id);

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function createRoom(req: Request & { user?: any }, res: Response) {
  try {
    const ownerId = Number(req.user.id);
    const result = await RoomService.createRoom(req.body, ownerId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function updateRoom(req: Request & { user?: any }, res: Response) {
  try {
    const id = Number(req.params.id);
    const requesterId = Number(req.user.id);
    const result = await RoomService.updateRoom(id, req.body, requesterId);

    if (!result.success) {
      const status = result.message === 'Room not found' ? 404 : 403;
      res.status(status).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function deleteRoom(req: Request & { user?: any }, res: Response) {
  try {
    const id = Number(req.params.id);
    const requesterId = Number(req.user.id);
    const result = await RoomService.deleteRoom(id, requesterId);

    if (!result.success) {
      const status = result.message === 'Room not found' ? 404 : 403;
      res.status(status).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
