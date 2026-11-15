
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService.js";

// Отримання товарів
export const getProducts = async (req, res) => {
    try {
        const products = await getAllProducts();

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Error fetching products:", error);

        return res.status(500).json({
            success: false,
            message: "Не вдалося отримати товари",
        });
    }
};

// Перевірка даних товару
function validateProduct(data, required = false) {
    const allowed = [
        "name",
        "slug",
        "sku",
        "description",
        "price",
        "stock",
        "imageUrl",
        "categoryId",
    ];

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Некоректне тіло запиту");
    }

    const fields = Object.keys(data);

    if (fields.length === 0 || fields.some((field) => !allowed.includes(field))) {
        throw new Error("Некоректні поля товару");
    }

    if (required) {
        for (const field of ["name", "slug", "sku", "price", "stock", "categoryId"]) {
            if (data[field] === undefined || data[field] === null) {
                throw new Error(`Обов'язкове поле: ${field}`);
            }
        }
    }

    const result = {};

    for (const field of ["name", "slug", "sku", "categoryId"]) {
        if (data[field] !== undefined) {
            if (typeof data[field] !== "string" || !data[field].trim()) {
                throw new Error(`Некоректне поле: ${field}`);
            }

            result[field] = data[field].trim();
        }
    }

    for (const field of ["description", "imageUrl"]) {
        if (data[field] !== undefined) {
            if (data[field] !== null && typeof data[field] !== "string") {
                throw new Error(`Некоректне поле: ${field}`);
            }

            result[field] = data[field] || null;
        }
    }

    if (data.price !== undefined) {
        const price = Number(data.price);

        if (
            data.price === null ||
            typeof data.price === "boolean" ||
            (typeof data.price !== "string" && typeof data.price !== "number") ||
            (typeof data.price === "string" && !data.price.trim()) ||
            !Number.isFinite(price) ||
            price < 0 ||
            price > 99999999.99 ||
            Math.round(price * 100) !== price * 100
        ) {
            throw new Error("Некоректна ціна");
        }

        result.price = price;
    }

    if (data.stock !== undefined) {
        const stock = Number(data.stock);

        if (
            data.stock === null ||
            typeof data.stock === "boolean" ||
            (typeof data.stock !== "string" && typeof data.stock !== "number") ||
            (typeof data.stock === "string" && !data.stock.trim()) ||
            !Number.isSafeInteger(stock) ||
            stock < 0 ||
            stock > 2147483647
        ) {
            throw new Error("Некоректна кількість");
        }

        result.stock = stock;
    }

    return result;
}

// Обробка помилок Prisma
function handleProductError(error, res) {
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

    if (error.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Товар не знайдено",
        });
    }

    console.error("Product error:", error);

    return res.status(500).json({
        success: false,
        message: "Помилка обробки товару",
    });
}

// Додавання товару
export const addProduct = async (req, res) => {
    let data;

    try {
        data = validateProduct(req.body, true);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    try {
        const product = await createProduct(data);

        return res.status(201).json({
            success: true,
            message: "Товар створено",
            data: product,
        });
    } catch (error) {
        return handleProductError(error, res);
    }
};

// Редагування товару
export const editProduct = async (req, res) => {
    let data;

    try {
        data = validateProduct(req.body);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    try {
        const product = await updateProduct(req.params.id, data);

        return res.status(200).json({
            success: true,
            message: "Товар оновлено",
            data: product,
        });
    } catch (error) {
        return handleProductError(error, res);
    }
};

// Видалення товару
export const removeProduct = async (req, res) => {
    try {
        await deleteProduct(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Товар видалено з каталогу",
        });
    } catch (error) {
        return handleProductError(error, res);
    }
};
