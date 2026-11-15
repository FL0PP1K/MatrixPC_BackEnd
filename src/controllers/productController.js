
import {
    getAllProducts,
    createProduct,
} from "../services/productService.js";

// Отримання всіх товарів
export const getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();

        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};

// Створення нового товару
export const addProduct = async (req, res) => {
    try {
        const {
            name,
            slug,
            sku,
            description,
            price,
            stock,
            imageUrl,
            categoryId,
        } = req.body;

        // Перевіряємо обов'язкові поля
        if (
            typeof name !== "string" || !name.trim() ||
            typeof slug !== "string" || !slug.trim() ||
            typeof sku !== "string" || !sku.trim() ||
            typeof categoryId !== "string" || !categoryId.trim() ||
            price === undefined || price === null ||
            !Number.isFinite(Number(price)) || Number(price) < 0 ||
            stock === undefined || stock === null ||
            !Number.isInteger(Number(stock)) || Number(stock) < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Некоректні дані товару",
            });
        }

        const product = await createProduct({
            name: name.trim(),
            slug: slug.trim(),
            sku: sku.trim(),
            description,
            price: Number(price),
            stock: Number(stock),
            imageUrl,
            categoryId: categoryId.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Товар успішно створено",
            data: product,
        });
    } catch (error) {
        console.error("Error creating product:", error);

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Товар із таким SKU або slug уже існує",
            });
        }

        if (error.code === "P2003") {
            return res.status(400).json({
                success: false,
                message: "Вказано неіснуючу категорію",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Не вдалося створити товар",
        });
    }
};
