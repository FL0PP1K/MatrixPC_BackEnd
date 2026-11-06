
import { prisma } from "../src/config/prisma.js";

const categories = [
    {
        name: "Процесори",
        slug: "processors",
        description: "Процесори для персональних комп'ютерів",
    },
    {
        name: "Відеокарти",
        slug: "graphics-cards",
        description: "Графічні карти для ПК",
    },
    {
        name: "Оперативна пам'ять",
        slug: "ram",
        description: "Модулі оперативної пам'яті",
    },
    {
        name: "SSD накопичувачі",
        slug: "ssd",
        description: "Твердотільні накопичувачі",
    },
];

const products = [
    {
        name: "AMD Ryzen 5 7600",
        slug: "amd-ryzen-5-7600",
        sku: "CPU-AMD-R5-7600",
        description: "Тестовий товар — процесор AMD Ryzen 5 7600",
        price: "7999.00",
        stock: 10,
        categorySlug: "processors",
    },
    {
        name: "NVIDIA GeForce RTX 4060 8GB",
        slug: "nvidia-geforce-rtx-4060",
        sku: "GPU-RTX-4060",
        description: "Тестовий товар — відеокарта RTX 4060",
        price: "13999.00",
        stock: 5,
        categorySlug: "graphics-cards",
    },
    {
        name: "Kingston Fury Beast 32GB DDR5",
        slug: "kingston-fury-beast-32gb",
        sku: "RAM-KF-32GB",
        description: "Тестовий товар — комплект оперативної пам'яті",
        price: "4299.00",
        stock: 15,
        categorySlug: "ram",
    },
    {
        name: "WD Black SN770 1TB",
        slug: "wd-black-sn770-1tb",
        sku: "SSD-WD-SN770-1TB",
        description: "Тестовий товар — SSD накопичувач",
        price: "3199.00",
        stock: 8,
        categorySlug: "ssd",
    },
];

async function main() {
    const categoryMap = {};

    for (const category of categories) {
        const savedCategory = await prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
        });

        categoryMap[category.slug] = savedCategory.id;
    }

    for (const product of products) {
        const { categorySlug, ...productData } = product;

        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {
                ...productData,
                categoryId: categoryMap[categorySlug],
            },
            create: {
                ...productData,
                categoryId: categoryMap[categorySlug],
            },
        });
    }

    console.log("Seed completed successfully!");
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });