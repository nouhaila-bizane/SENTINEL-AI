import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email').max(120),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  notificationPreferences: z
    .object({
      emailAnalysisComplete: z.boolean().optional(),
      emailSecurityAlerts: z.boolean().optional(),
      emailReleaseDecisions: z.boolean().optional(),
    })
    .optional(),
});

export const createAnalysisSchema = z.object({
  projectName: z.string().min(2, 'Project name required').max(120),
  description: z.string().max(2000).optional().default(''),
  analysisType: z.enum(['full', 'security', 'specification', 'verification']).default('full'),
  sourceCode: z.string().min(1, 'Source code required').max(500000),
  fileName: z.string().max(255).optional(),
});

export const recoveryAttemptSchema = z.object({
  issue: z.string().min(1).max(1000),
  proposedCorrection: z.string().min(1).max(10000),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().max(500).optional(),
});

export const updatePlatformSettingsSchema = z.object({
  allowRegistration: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
  maxRecoveryAttempts: z.number().int().min(0).max(10).optional(),
});