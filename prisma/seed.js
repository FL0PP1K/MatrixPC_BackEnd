
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
        description: "Настільний процесор AMD Ryzen 5 7600 із сокетом AM5.",
        specifications: { "Сокет": "AM5", "Ядра / потоки": "6 / 12", "Базова частота": "3.8 GHz", "Максимальна частота": "5.1 GHz" },
        price: "7999.00",
        stock: 10,
        categorySlug: "processors",
    },
    {
        name: "NVIDIA GeForce RTX 4060 8GB",
        slug: "nvidia-geforce-rtx-4060",
        sku: "GPU-RTX-4060",
        description: "Відеокарта NVIDIA GeForce RTX 4060 з 8 GB відеопам’яті GDDR6.",
        specifications: { "Відеопам’ять": "8 GB GDDR6", "Інтерфейс": "PCI Express 4.0" },
        price: "13999.00",
        stock: 5,
        categorySlug: "graphics-cards",
    },
    {
        name: "Kingston Fury Beast 32GB DDR5",
        slug: "kingston-fury-beast-32gb",
        sku: "RAM-KF-32GB",
        description: "Комплект Kingston Fury Beast DDR5 загальним обсягом 32 GB.",
        specifications: { "Обсяг": "32 GB", "Тип пам’яті": "DDR5" },
        price: "4299.00",
        stock: 15,
        categorySlug: "ram",
    },
    {
        name: "WD Black SN770 1TB",
        slug: "wd-black-sn770-1tb",
        sku: "SSD-WD-SN770-1TB",
        description: "SSD накопичувач WD Black SN770 обсягом 1 TB з інтерфейсом PCIe Gen 4.0.",
        specifications: { "Обсяг": "1 TB", "Форм-фактор": "M.2 2280", "Інтерфейс": "PCIe Gen 4.0 x4" },
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