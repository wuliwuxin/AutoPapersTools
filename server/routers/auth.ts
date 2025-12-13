/**
 * Authentication Router
 * Handles user registration, login, and authentication
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { cryptoService } from '../_core/crypto';
import { jwtService } from '../_core/jwt';
import { createUser, getUserByEmail, updateUserLastSignIn } from '../db';
import { COOKIE_NAME } from '@shared/const';
import { getSessionCookieOptions } from '../_core/cookies';

export const authRouter = router({
  /**
   * 用户注册
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;

      // 检查用户是否已存在
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // 哈希密码
      const passwordHash = await cryptoService.hashPassword(password);

      // 创建用户
      const user = await createUser(email, passwordHash, name);

      // 生成 JWT 令牌
      const token = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // 设置 cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    }),

  /**
   * 用户登录
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      // 查找用户
      const user = await getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // 验证密码
      const isValidPassword = await cryptoService.comparePassword(
        password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // 更新最后登录时间
      await updateUserLastSignIn(user.id);

      // 生成 JWT 令牌
      const token = jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // 设置 cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    }),

  /**
   * 获取当前用户信息
   */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
    };
  }),

  /**
   * 用户登出
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    };
  }),

  /**
   * 刷新令牌
   */
  refresh: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Not authenticated');
    }

    // 生成新的 JWT 令牌
    const token = jwtService.generateAccessToken({
      userId: ctx.user.id,
      email: ctx.user.email,
      role: ctx.user.role,
    });

    // 设置 cookie
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

    return {
      success: true,
      token,
    };
  }),
});
