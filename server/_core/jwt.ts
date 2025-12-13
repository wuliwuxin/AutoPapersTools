/**
 * JWT Service
 * Handles JWT token generation and verification
 */

import jwt from 'jsonwebtoken';
import { ENV } from './env';

const JWT_SECRET = process.env.JWT_SECRET || ENV.cookieSecret || 'default-secret-change-me';
const JWT_EXPIRES_IN = '7d'; // 7 days
const JWT_REFRESH_EXPIRES_IN = '30d'; // 30 days

export interface JWTPayload {
  userId: number;
  email: string;
  role?: string;
}

export class JWTService {
  /**
   * 生成访问令牌
   */
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * 生成刷新令牌
   */
  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
  }

  /**
   * 验证令牌
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('[JWT] Token verification failed:', error);
      return null;
    }
  }

  /**
   * 解码令牌（不验证）
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}

export const jwtService = new JWTService();
