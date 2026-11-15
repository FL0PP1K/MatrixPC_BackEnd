
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/categoryService.js";

// Отримання категорій
export const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();

        return res.json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);

        return res.status(500).json({
            success: false,
            message: "Не вдалося отримати категорії",
        });
    }
};

// Перевірка даних
function validateCategory(body, required = false) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Некоректні дані");
    }

    const allowed = ["name", "slug", "description"];
    const fields = Object.keys(body);

    if (
        fields.length === 0 ||
        fields.some((field) => !allowed.includes(field))
    ) {
        throw new Error("Некоректні поля категорії");
    }

    if (
        required &&
        (body.name === undefined || body.slug === undefined)
    ) {
        throw new Error("Назва та slug обов'язкові");
    }

    const data = {};

    for (const field of ["name", "slug"]) {
        if (body[field] !== undefined) {
            if (
                typeof body[field] !== "string" ||
                !body[field].trim()
            ) {
                throw new Error(`Некоректне поле: ${field}`);
            }

            data[field] = body[field].trim();
        }
    }

    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
        throw new Error("Slug може містити тільки латинські літери, цифри та дефіс");
    }

    if (body.description !== undefined) {
        if (
            body.description !== null &&
            typeof body.description !== "string"
        ) {
            throw new Error("Некоректний опис");
        }

        data.description = body.description || null;
    }

    return data;
}

// Обробка помилок Prisma
function handleError(error, res) {
    if (error.code === "P2002") {
        return res.status(409).json({
            success: false,
            message: "Категорія з таким slug уже існує",
        });
    }

    if (error.code === "P2025") {
        return res.status(404).json({
            success: false,
            message: "Категорію не знайдено",
        });
    }

    if (error.code === "P2003") {
        return res.status(409).json({
            success: false,
            message: "Спочатку потрібно прибрати товари з цієї категорії",
        });
    }

    console.error("Category error:", error);

    return res.status(500).json({
        success: false,
        message: "Помилка обробки категорії",
    });
}

// Додавання
export const addCategory = async (req, res) => {
    let data;

    try {
        data = validateCategory(req.body, true);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    try {
        const category = await createCategory(data);

        return res.status(201).json({
            success: true,
            message: "Категорію створено",
            data: category,
        });
    } catch (error) {
        return handleError(error, res);
    }
};

// Редагування
export const editCategory = async (req, res) => {
    let data;

    try {
        data = validateCategory(req.body);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    try {
        const category = await updateCategory(req.params.id, data);

        return res.json({
            success: true,
            message: "Категорію оновлено",
            data: category,
        });
    } catch (error) {
        return handleError(error, res);
    }
};

// Видалення
export const removeCategory = async (req, res) => {
    try {
        await deleteCategory(req.params.id);

        return res.json({
            success: true,
            message: "Категорію видалено",
        });
    } catch (error) {
        return handleError(error, res);
    }
};
