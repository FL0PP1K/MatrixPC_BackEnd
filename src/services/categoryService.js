
import { prisma } from "../config/prisma.js";

// Отримання категорій
export const getAllCategories = async () => {
    return prisma.category.findMany({
        include: {
            _count: {
                select: { products: true },
            },
        },
        orderBy: { name: "asc" },
    });
};

// Створення категорії
export const createCategory = async (data) => {
    return prisma.category.create({
        data,
    });
};

// Редагування категорії
export const updateCategory = async (id, data) => {
    return prisma.category.update({
        where: { id },
        data,
    });
};

// Видалення категорії
export const deleteCategory = async (id) => {
    return prisma.category.delete({
        where: { id },
    });
};
