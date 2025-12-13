/**
 * Encryption Service
 * Provides AES-256-GCM encryption for API keys and bcrypt hashing for passwords
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export class CryptoService {
  private key: Buffer;

  constructor() {
    // 使用环境变量或生成的密钥
    this.key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
  }

  /**
   * 加密文本（用于 API 密钥）
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // 格式: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密文本
   */
  decrypt(ciphertext: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
      
      if (!ivHex || !authTagHex || !encrypted) {
        throw new Error('Invalid ciphertext format');
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('[Crypto] Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * 哈希密码
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 生成随机令牌
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}

// 单例实例
export const cryptoService = new CryptoService();
