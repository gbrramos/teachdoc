import { Router } from 'express';
import {listRooms, getRoom, createRoom, updateRoom, deleteRoom, associateRoom} from '../controllers/RoomController';
import { authenticate } from '../middlewares/auth.middleware';

const roomRoutes = Router();

roomRoutes.get('/rooms', authenticate, listRooms);
roomRoutes.get('/rooms/:id', authenticate, getRoom);
roomRoutes.post('/rooms', authenticate, createRoom);
roomRoutes.put('/rooms/:id', authenticate, updateRoom);
roomRoutes.patch('/associate/room/:roomId/user/:userId', authenticate, associateRoom);
roomRoutes.delete('/rooms/:id', authenticate, deleteRoom);

export default roomRoutes;
