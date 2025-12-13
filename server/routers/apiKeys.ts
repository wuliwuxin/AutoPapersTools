/**
 * API Keys Router
 * Handles CRUD operations for user API keys
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { cryptoService } from '../_core/crypto';
import {
  createAPIKey,
  getUserAPIKeys,
  getAPIKeyById,
  updateAPIKey,
  deleteAPIKey,
} from '../db';

const providerEnum = z.enum(['deepseek', 'openai', 'claude', 'gemini']);

export const apiKeysRouter = router({
  /**
   * 添加 API 密钥
   */
  add: protectedProcedure
    .input(
      z.object({
        provider: providerEnum,
        apiKey: z.string().min(1, 'API key is required'),
        modelName: z.string().min(1, 'Model name is required'),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { provider, apiKey, modelName, isDefault } = input;

      // 加密 API 密钥
      const encrypted = cryptoService.encrypt(apiKey);

      // 如果设置为默认，取消其他同类型的默认设置
      if (isDefault) {
        const existingKeys = await getUserAPIKeys(ctx.user.id);
        for (const key of existingKeys) {
          if (key.provider === provider && key.isDefault) {
            await updateAPIKey(key.id, { isDefault: false });
          }
        }
      }

      // 创建 API 密钥
      const newKey = await createAPIKey(
        ctx.user.id,
        provider,
        encrypted,
        modelName,
        isDefault
      );

      return {
        success: true,
        keyId: newKey.id,
      };
    }),

  /**
   * 获取用户的 API 密钥列表
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const keys = await getUserAPIKeys(ctx.user.id);

    // 返回时部分隐藏密钥
    return keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      modelName: k.modelName,
      isDefault: k.isDefault,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      // 只显示前8个字符
      apiKeyPreview: k.apiKeyEncrypted ? '••••••••' : '',
    }));
  }),

  /**
   * 更新 API 密钥
   */
  update: protectedProcedure
    .input(
      z.object({
        keyId: z.number(),
        apiKey: z.string().optional(),
        modelName: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { keyId, apiKey, modelName, isDefault } = input;

      // 验证密钥属于当前用户
      const existingKey = await getAPIKeyById(keyId);
      if (!existingKey || existingKey.userId !== ctx.user.id) {
        throw new Error('API key not found');
      }

      const updates: any = {};

      if (apiKey) {
        updates.apiKeyEncrypted = cryptoService.encrypt(apiKey);
      }

      if (modelName) {
        updates.modelName = modelName;
      }

      if (isDefault !== undefined) {
        // 如果设置为默认，取消其他同类型的默认设置
        if (isDefault) {
          const userKeys = await getUserAPIKeys(ctx.user.id);
          for (const key of userKeys) {
            if (
              key.provider === existingKey.provider &&
              key.id !== keyId &&
              key.isDefault
            ) {
              await updateAPIKey(key.id, { isDefault: false });
            }
          }
        }
        updates.isDefault = isDefault;
      }

      await updateAPIKey(keyId, updates);

      return {
        success: true,
      };
    }),

  /**
   * 删除 API 密钥
   */
  delete: protectedProcedure
    .input(
      z.object({
        keyId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { keyId } = input;

      // 验证密钥属于当前用户
      const existingKey = await getAPIKeyById(keyId);
      if (!existingKey || existingKey.userId !== ctx.user.id) {
        throw new Error('API key not found');
      }

      await deleteAPIKey(keyId);

      return {
        success: true,
      };
    }),

  /**
   * 获取默认 API 密钥（用于分析）
   */
  getDefault: protectedProcedure
    .input(
      z.object({
        provider: providerEnum.optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const keys = await getUserAPIKeys(ctx.user.id);

      let defaultKey;
      if (input.provider) {
        // 查找指定提供商的默认密钥
        defaultKey = keys.find(
          (k) => k.provider === input.provider && k.isDefault
        );
      } else {
        // 查找任意默认密钥
        defaultKey = keys.find((k) => k.isDefault);
      }

      if (!defaultKey) {
        return null;
      }

      // 解密密钥
      const decryptedKey = cryptoService.decrypt(defaultKey.apiKeyEncrypted);

      return {
        id: defaultKey.id,
        provider: defaultKey.provider,
        modelName: defaultKey.modelName,
        apiKey: decryptedKey,
      };
    }),
});
