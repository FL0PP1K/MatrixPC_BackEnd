import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma.js";

export const authenticateToken = async (req, res, next) => {
    // Отримуємо Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Для доступу необхідна авторизація",
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Токен авторизації відсутній",
        });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("JWT_SECRET is not configured");

        return res.status(500).json({
            success: false,
            message: "Помилка конфігурації сервера",
        });
    }

    try {
        // Перевіряємо JWT
        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded !== "object" ||
            typeof decoded.sub !== "string"
        ) {
            return res.status(401).json({
                success: false,
                message: "Недійсний токен авторизації",
            });
        }

        // Перевіряємо, чи існує користувач у базі
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.sub,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Користувача не знайдено",
            });
        }

        // Передаємо дані користувача наступному обробнику
        req.user = user;

        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Токен недійсний або термін його дії закінчився",
            });
        }

        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Помилка перевірки авторизації",
        });
    }
};
