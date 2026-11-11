import { prisma } from "../config/prisma.js";

export async function saveContactInquiry(data) {
    const inquiry = await prisma.contactInquiry.create({
        data: {
            ...data,
            consentAt: new Date(),
        },
        select: {
            id: true,
            createdAt: true,
        },
    });

    return inquiry;
}

