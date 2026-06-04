import { Router } from 'express';
import { getVersion, login, seedDefaultUser, listUsers, createUser, getAuthenticated } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth.middleware';

const authRoutes = Router();

authRoutes.get('/version', getVersion);
authRoutes.post('/login', login);
authRoutes.get('/seed-default-user', seedDefaultUser);
authRoutes.get('/get-authenticated', authenticate ,getAuthenticated)
authRoutes.get('/users', authenticate, listUsers);
authRoutes.post('/users', createUser);

export default authRoutes;