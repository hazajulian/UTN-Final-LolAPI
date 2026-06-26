// auth.schema.js
// Validaciones Zod para autenticacion, perfil y recuperacion de contraseña.

import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, {
    message: "La contraseña debe tener al menos 8 caracteres",
  })
  .max(64, {
    message: "La contraseña no puede superar los 64 caracteres",
  })
  .regex(/[A-Z]/, {
    message: "La contraseña debe contener al menos una mayúscula",
  })
  .regex(/[a-z]/, {
    message: "La contraseña debe contener al menos una minúscula",
  })
  .regex(/[0-9]/, {
    message: "La contraseña debe contener al menos un número",
  })
  .regex(/[^A-Za-z0-9]/, {
    message: "La contraseña debe contener al menos un carácter especial",
  });

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, {
        message: "Username mínimo 3 caracteres",
      })
      .max(30, {
        message: "Username máximo 30 caracteres",
      }),

    email: z.string().email({
      message: "Email inválido",
    }),

    password: passwordSchema,

    confirmPassword: z.string().min(1, {
      message: "confirmPassword es obligatorio",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),

  password: z.string().min(1, {
    message: "Password es obligatorio",
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, {
      message: "Token es obligatorio",
    }),

    newPassword: passwordSchema,

    confirmPassword: z.string().min(1, {
      message: "confirmPassword es obligatorio",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, {
      message: "oldPassword es obligatorio",
    }),

    newPassword: passwordSchema,

    confirmPassword: z.string().min(1, {
      message: "confirmPassword es obligatorio",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: "Username mínimo 3 caracteres",
    })
    .max(30, {
      message: "Username máximo 30 caracteres",
    })
    .optional(),

  email: z
    .string()
    .email({
      message: "Email inválido",
    })
    .optional(),

  password: z.string().min(1, {
    message: "Password es obligatoria para actualizar el perfil",
  }),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, {
    message: "Password es obligatorio",
  }),
});