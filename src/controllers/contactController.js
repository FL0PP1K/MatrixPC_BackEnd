import { saveContactInquiry } from "../services/contactService.js";

const topics = new Set(["pc_selection", "order", "warranty", "return", "other"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createContactInquiry(req, res) {
    const { name, email, topic, message, consent } = req.body ?? {};

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof topic !== "string" ||
        typeof message !== "string" ||
        consent !== true
    ) {
        return res.status(400).json({
            success: false,
            message: "Заповніть обов’язкові поля та надайте згоду на обробку даних",
        });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMessage = message.trim();

    if (normalizedName.length < 2 || normalizedName.length > 80) {
        return res.status(400).json({
            success: false,
            message: "Ім’я має містити від 2 до 80 символів",
        });
    }

    if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: "Вкажіть коректну електронну пошту",
        });
    }

    if (!topics.has(topic)) {
        return res.status(400).json({
            success: false,
            message: "Оберіть тему звернення зі списку",
        });
    }

    if (normalizedMessage.length < 10 || normalizedMessage.length > 3000) {
        return res.status(400).json({
            success: false,
            message: "Повідомлення має містити від 10 до 3000 символів",
        });
    }

    try {
        const inquiry = await saveContactInquiry({
            name: normalizedName,
            email: normalizedEmail,
            topic,
            message: normalizedMessage,
        });

        return res.status(201).json({
            success: true,
            message: "Звернення зареєстровано",
            data: inquiry,
        });
    } catch (error) {
        console.error("Contact inquiry error:", error);
        return res.status(500).json({
            success: false,
            message: "Не вдалося зареєструвати звернення. Спробуйте пізніше",
        });
    }
}

