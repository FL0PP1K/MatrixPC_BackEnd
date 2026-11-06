import { prisma } from "../config/prisma.js";

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