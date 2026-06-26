// user-modeldb.js
// Define el modelo de usuarios de LoL Hub, autenticacion, reset de contraseña y favoritos.

import mongoose from "mongoose";

import {
  hashPassword,
  verifyPassword,
  makeSessionToken,
} from "../../utils/crypto-service.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    sessionToken: {
      type: String,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },

    favorites: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hashea la contraseña antes de guardar el usuario.
UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashPassword(this.password);
  }

  next();
});

// Compara una contraseña plana con la contraseña guardada.
UserSchema.methods.verifyPassword = function (plain) {
  return verifyPassword(plain, this.password);
};

// Genera y guarda un token de sesion.
UserSchema.methods.generateSessionToken = function () {
  const token = makeSessionToken();

  this.sessionToken = token;

  return token;
};

export const User = mongoose.model("User", UserSchema);