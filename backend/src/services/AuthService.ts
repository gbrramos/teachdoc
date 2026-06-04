import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../database/connection';
import { LoginRequest, LoginResponse, JWTPayload, CreateUserRequest } from '../types/index';
import { User, UserRoles } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = (process.env.JWT_EXPIRATION || '7d') as jwt.SignOptions['expiresIn'];

export class AuthService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async getAuthenticatedUser(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return null;
    return { ...user, id: String(user.id), role: user.role as UserRoles };
  }

  static async getUsers(): Promise<User[]> {
    const users = await prisma.user.findMany(
        {select: { id: true, email: true, role: true }}
    );
    return users.map((u: any) => ({ ...u, id: String(u.id), role: u.role as UserRoles }));
  }

  static async createUser(data: CreateUserRequest): Promise<{ success: boolean; message: string; user?: { id: string; email: string; role: UserRoles } }> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, message: 'Email already in use' };
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, password: hashed },
    });

    return {
      success: true,
      message: 'User created successfully',
      user: { id: String(user.id), email: user.email, role: user.role as UserRoles },
    };
  }

  static async seedDefaultUser(): Promise<{ success: boolean; message: string }> {
    const DEFAULT_EMAIL = process.env.DEFAULT_USER_EMAIL || 'admin@teachdoc.com';
    const DEFAULT_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'admin';

    const existing = await prisma.user.findUnique({ where: { email: DEFAULT_EMAIL } });
    if (existing) {
      return { success: false, message: 'Default user already exists' };
    }

    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await prisma.user.create({ data: { email: DEFAULT_EMAIL, password: hashed, role: UserRoles.ADMIN, name: 'Admin' } });

    return { success: true, message: `Default user created: ${DEFAULT_EMAIL}` };
  }

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return { success: false, message: 'Invalid email or password' };
      }

      const payload: JWTPayload = { id: String(user.id), email: user.email };
      const token = this.generateToken(payload);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: { id: payload.id, email: payload.email, role: user.role as UserRoles },
      };
    } catch (error) {
      return { success: false, message: 'An error occurred during login' };
    }
  }
}

