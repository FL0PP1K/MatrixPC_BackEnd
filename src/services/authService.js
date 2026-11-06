
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

// Створення JWT-токена
const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            sub: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
    );
};

// Безпечні дані користувача
const getSafeUser = (user) => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdAt: user.createdAt,
});

// Реєстрація користувача
export const registerUser = async ({
    email,
    password,
    firstName,
    lastName,
}) => {
    // Перевіряємо, чи існує користувач
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const error = new Error(
            "Користувач із такою електронною поштою вже існує"
        );
        error.statusCode = 409;
        throw error;
    }

    // Хешуємо пароль
    const passwordHash = await bcrypt.hash(password, 12);

    // Створюємо користувача
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
        },
    });

    const token = generateToken(user);

    return {
        user: getSafeUser(user),
        token,
    };
};

// Авторизація користувача
export const loginUser = async ({ email, password }) => {
    // Шукаємо користувача за email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Однакова помилка для невідомого email і неправильного пароля
    if (!user) {
        const error = new Error("Неправильна електронна пошта або пароль");
        error.statusCode = 401;
        throw error;
    }

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        const error = new Error("Неправильна електронна пошта або пароль");
        error.statusCode = 401;
        throw error;
    }

    // Генеруємо токен
    const token = generateToken(user);

    return {
        user: getSafeUser(user),
        token,
    };
};
