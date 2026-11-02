import { Request, Response } from 'express';
import { asyncHandler } from '../../utils';
import * as authService from './auth.service';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json({
    success: true,
    data: result,
    message: 'Account created successfully',
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.json({
    success: true,
    data: result,
    message: 'Login successful',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  res.json({
    success: true,
    data: tokens,
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);
  res.json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);
  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.changePassword(req.user!.id, req.body);
  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});
