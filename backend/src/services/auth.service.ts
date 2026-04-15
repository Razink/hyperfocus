import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(2, 'Le nom d\'utilisateur doit contenir au moins 2 caractères').max(50).optional(),
  name: z.string().min(1, 'Le prénom est requis').max(100),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  password: z.string().min(4, 'Le mot de passe doit contenir au moins 4 caractères')
}).refine(data => data.username || data.email, {
  message: 'Un nom d\'utilisateur ou un email est requis'
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Nom d\'utilisateur ou email requis'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

export class AuthService {
  async register(data: { username?: string; name: string; email?: string; password: string }) {
    const validated = registerSchema.parse(data);

    // Check if username already taken
    if (validated.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username: validated.username }
      });
      if (existingUsername) {
        const error: any = new Error('Ce nom d\'utilisateur est déjà pris');
        error.status = 400;
        error.code = 'USERNAME_EXISTS';
        throw error;
      }
    }

    // Check if email already taken
    if (validated.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validated.email }
      });
      if (existingEmail) {
        const error: any = new Error('Cet email est déjà utilisé');
        error.status = 400;
        error.code = 'EMAIL_EXISTS';
        throw error;
      }
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        username: validated.username || null,
        name: validated.name,
        email: validated.email || null,
        passwordHash,
        role: 'ELEVE'
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });

    const token = generateToken(user.id);

    return { user, token };
  }

  async login(data: { identifier: string; password: string }) {
    const validated = loginSchema.parse(data);

    // Try to find by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validated.identifier },
          { email: validated.identifier }
        ]
      }
    });

    if (!user) {
      const error: any = new Error('Identifiant ou mot de passe incorrect');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isPasswordValid = await comparePassword(validated.password, user.passwordHash);

    if (!isPasswordValid) {
      const error: any = new Error('Identifiant ou mot de passe incorrect');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
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
        username: true,
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
