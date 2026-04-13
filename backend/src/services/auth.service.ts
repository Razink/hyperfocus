import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Le prénom est requis').max(100),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const validated = registerSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      const error: any = new Error('Cet email est déjà utilisé');
      error.status = 400;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: 'ELEVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    const token = generateToken(user.id);

    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const validated = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      const error: any = new Error('Email ou mot de passe incorrect');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isPasswordValid = await comparePassword(validated.password, user.passwordHash);

    if (!isPasswordValid) {
      const error: any = new Error('Email ou mot de passe incorrect');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    if (!user) {
      const error: any = new Error('Utilisateur non trouvé');
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user;
  }
}
