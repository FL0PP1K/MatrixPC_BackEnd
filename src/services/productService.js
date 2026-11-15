
import { prisma } from "../config/prisma.js";

// Отримання всіх активних товарів
export const getAllProducts = async () => {
    return await prisma.product.findMany({
        where: {
            isActive: true,
        },
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

// Створення нового товару
export const createProduct = async (data) => {
    return await prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            sku: data.sku,
            description: data.description || null,
            price: data.price,
            stock: data.stock,
            imageUrl: data.imageUrl || null,
            categoryId: data.categoryId,
            isActive: true,
        },
        include: {
            category: true,
        },
    });
};
