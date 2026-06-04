import { AuthService } from '../services/AuthService';
import { LoginRequest, CreateUserRequest } from '../types/index';
import { Request, Response } from 'express';

export async function createUser(req: any, res: any) {
    try {
        const body: CreateUserRequest = req.body;
        const response = await AuthService.createUser(body);
        const status = response.success ? 201 : 409;
        res.status(status).json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function listUsers(req: any, res: any) {
    try {
        const users = await AuthService.getUsers();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function getAuthenticated(req: Request & { user?: any }, res: Response) {
    try {
        const userId = Number(req.user?.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(401).json({ success: false, message: 'Invalid user session' });
            return;
        }

        const user = await AuthService.getAuthenticatedUser(userId);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function seedDefaultUser(req: any, res: any) {
    try {
        const response = await AuthService.seedDefaultUser();
        const status = response.success ? 201 : 409;
        res.status(status).json(response);
    } catch (error) {
        console.error('Error seeding default user:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export function getVersion(req: any, res: any) {
    res.json({ version: '1.0.0' });
}

export async function login(req: any, res: any) {
    try {
        const credentials: LoginRequest = req.body;
        const response = await AuthService.login(credentials);

        if (response.success) {
            res.status(200).json(response);
        } else {
            res.status(401).json(response);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}