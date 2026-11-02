import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../utils';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.validation';
import { UserRole } from '../../types/enums';

const SALT_ROUNDS = 12;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate JWT access and refresh tokens.
 */
function generateTokens(userId: string, email: string, role: string, storeId: string | null): TokenPair {
  const accessToken = jwt.sign(
    { userId, email, role, storeId },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as any
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn } as any
  );

  return { accessToken, refreshToken };
}

/**
 * Register a new user.
 */
export async function register(data: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.STORE_OWNER,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      storeId: true,
      createdAt: true,
    },
  });

  const tokens = generateTokens(user.id, user.email, user.role, user.storeId);

  return { user, ...tokens };
}

/**
 * Login with email and password.
 */
export async function login(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      role: true,
      storeId: true,
      isActive: true,
    },
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const tokens = generateTokens(user.id, user.email, user.role, user.storeId);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, ...tokens };
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as {
      userId: string;
      type: string;
    };

    if (decoded.type !== 'refresh') {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        storeId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('User not found or inactive');
    }

    const tokens = generateTokens(user.id, user.email, user.role, user.storeId);

    return tokens;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
}

/**
 * Get current user profile.
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      storeId: true,
      createdAt: true,
      updatedAt: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
}

/**
 * Update user profile.
 */
export async function updateProfile(userId: string, data: Partial<{ firstName: string; lastName: string; email: string }>) {
  if (data.email) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email.toLowerCase(), id: { not: userId } },
    });
    if (existing) {
      throw ApiError.conflict('This email is already in use');
    }
    data.email = data.email.toLowerCase();
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      storeId: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Change password.
 */
export async function changePassword(userId: string, data: ChangePasswordInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });
}
