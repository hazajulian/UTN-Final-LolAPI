// user-controller.js
// Controla autenticacion, perfil, usuarios, reset de contraseña y favoritos.

import crypto from "crypto";

import { User } from "../models/mongodb/user-modeldb.js";
import { Champion } from "../models/mongodb/champion-modeldb.js";

import {
  sendWelcomeMail,
  sendResetPasswordMail,
  sendPasswordChangedMail,
  sendAccountDeletedMail,
} from "../utils/mail-service.js";

import { notFound } from "../utils/httpError.js";

function createResetTokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Registra un nuevo usuario.
export async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });

  if (exists) {
    return res.status(409).json({ message: "Email o username ya en uso" });
  }

  const user = new User({ username, email, password });
  await user.save();

  const token = user.generateSessionToken();
  await user.save();

  sendWelcomeMail({
    to: user.email,
    username: user.username,
  }).catch((err) => {
    console.error("Error enviando email de bienvenida:", err);
  });

  return res.status(201).json({
    message: "Usuario registrado correctamente",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
}

// Inicia sesion y devuelve token.
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email y password son obligatorios",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ message: "Email o contraseña incorrectos" });
  }

  const token = user.generateSessionToken();
  await user.save();

  return res.json({
    message: "Login exitoso",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
}

// Obtiene el perfil del usuario autenticado.
export async function getProfile(req, res) {
  const user = await User.findById(req.user._id).select("username email favorites");

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json({
    username: user.username,
    email: user.email,
    favorites: user.favorites || [],
  });
}

// Cierra sesion invalidando el token actual.
export async function logout(req, res) {
  req.user.sessionToken = null;
  await req.user.save();

  return res.json({ message: "Logout exitoso" });
}

// Actualiza datos basicos del perfil.
export async function updateProfile(req, res) {
  const user = req.user;
  const { username, email, password } = req.body;

  if (!password || !(await user.verifyPassword(password))) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  if (username && username !== user.username) {
    const usernameExists = await User.findOne({
      username,
      _id: { $ne: user._id },
    });

    if (usernameExists) {
      return res.status(409).json({ message: "Username ya en uso" });
    }

    user.username = username;
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (emailExists) {
      return res.status(409).json({ message: "Email ya en uso" });
    }

    user.email = email;
  }

  await user.save();

  return res.json({
    message: "Perfil actualizado",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

// Cambia la contraseña del usuario autenticado.
export async function changePassword(req, res) {
  const user = req.user;
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Campos de contraseña inválidos" });
  }

  if (!(await user.verifyPassword(oldPassword))) {
    return res.status(401).json({ message: "Contraseña antigua incorrecta" });
  }

  user.password = newPassword;
  await user.save();

  sendPasswordChangedMail({
    to: user.email,
    username: user.username,
  }).catch((err) => {
    console.error("Error enviando email de cambio de contraseña:", err);
  });

  return res.json({ message: "Contraseña cambiada exitosamente" });
}

// Elimina la cuenta del usuario autenticado.
export async function deleteAccount(req, res) {
  const user = req.user;
  const { password } = req.body;

  if (!password || !(await user.verifyPassword(password))) {
    return res.status(401).json({ message: "Contraseña incorrecta" });
  }

  const deletedUserEmail = user.email;
  const deletedUsername = user.username;

  await User.deleteOne({ _id: user._id });

  sendAccountDeletedMail({
    to: deletedUserEmail,
    username: deletedUsername,
  }).catch((err) => {
    console.error("Error enviando email de cuenta eliminada:", err);
  });

  return res.json({ message: "Cuenta eliminada correctamente" });
}

// Lista todos los usuarios.
export async function listUsers(req, res) {
  const users = await User.find().select("username email createdAt updatedAt");

  return res.json(users);
}

// Obtiene un usuario por id.
export async function getUserById(req, res) {
  const user = await User.findById(req.params.id).select(
    "username email createdAt updatedAt"
  );

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json(user);
}

// Obtiene un usuario por username.
export async function getUserByUsername(req, res) {
  const user = await User.findOne({ username: req.params.username }).select(
    "username email createdAt updatedAt"
  );

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json(user);
}

// Solicita un email de recuperacion de contraseña.
export async function forgotPassword(req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = createResetTokenHash(token);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await sendResetPasswordMail({
        to: user.email,
        username: user.username,
        resetUrl,
      });
    } catch (err) {
      console.error("Error enviando email de reseteo:", err);
    }
  }

  return res.json({
    message: "Si existe, te hemos enviado un email con instrucciones",
  });
}

// Restablece la contraseña con un token valido.
export async function resetPassword(req, res) {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Datos inválidos o contraseñas no coinciden",
    });
  }

  const tokenHash = createResetTokenHash(token);

  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return res.status(400).json({ message: "Token inválido o expirado" });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendPasswordChangedMail({
    to: user.email,
    username: user.username,
  }).catch((err) => {
    console.error("Error enviando email de contraseña restablecida:", err);
  });

  return res.json({ message: "Contraseña restablecida correctamente" });
}

function normalizeChampionId(id) {
  return String(id || "").trim();
}

// Lista favoritos como ids.
export async function listFavorites(req, res) {
  const user = await User.findById(req.user._id).select("favorites");

  return res.json({ favorites: user?.favorites || [] });
}

// Lista favoritos con datos completos.
export async function listFavoritesFull(req, res) {
  const user = await User.findById(req.user._id).select("favorites");
  const favorites = user?.favorites || [];

  if (!favorites.length) {
    return res.json({
      data: [],
      favorites: [],
    });
  }

  const champions = await Champion.find({ id: { $in: favorites } })
    .select("id name title iconUrl splashUrl region positions seed")
    .sort({ name: 1 });

  return res.json({
    favorites,
    data: champions,
  });
}

// Agrega un campeon a favoritos.
export async function addFavorite(req, res, next) {
  const id = normalizeChampionId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const champion = await Champion.findOne({
    id: new RegExp(`^${id}$`, "i"),
  }).select("id");

  if (!champion) {
    return next(notFound("Campeón no encontrado"));
  }

  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { favorites: champion.id } },
    { new: true }
  );

  return res.json({
    message: "Favorito agregado",
    id: champion.id,
  });
}

// Elimina un campeon de favoritos.
export async function removeFavorite(req, res) {
  const id = normalizeChampionId(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const champion = await Champion.findOne({
    id: new RegExp(`^${id}$`, "i"),
  }).select("id");

  const storedId = champion?.id || id;

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { favorites: storedId },
  });

  return res.json({
    message: "Favorito eliminado",
    id: storedId,
  });
}