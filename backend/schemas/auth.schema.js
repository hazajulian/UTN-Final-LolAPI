// schemas/auth.schema.js
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username mínimo 3 caracteres' }).max(30),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(4, { message: 'Password mínimo 4 caracteres' }).max(16)
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'Password es obligatorio' })
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email inválido' })
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Token es obligatorio' }),
  newPassword: z.string().min(4, { message: 'La nueva contraseña debe tener entre 4 y 16 caracteres' }).max(16),
  confirmPassword: z.string().min(1, { message: 'confirmPassword es obligatorio' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: 'oldPassword es obligatorio' }),
  newPassword: z.string().min(4, { message: 'La nueva contraseña debe tener entre 4 y 16 caracteres' }).max(16),
  confirmPassword: z.string().min(1, { message: 'confirmPassword es obligatorio' })
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email({ message: 'Email inválido' }).optional(),
  password: z.string().min(1, { message: 'Password es obligatoria para actualizar el perfil' })
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, { message: 'Password es obligatorio' })
});
