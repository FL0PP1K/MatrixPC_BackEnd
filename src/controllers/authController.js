import {
    registerUser,
    loginUser,
    updateUserProfile,
} from "../services/authService.js";

// Реєстрація користувача
export const register = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
        } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Вкажіть електронну пошту та пароль",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Некоректний формат електронної пошти",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Пароль повинен містити щонайменше 8 символів",
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Пароль занадто довгий",
            });
        }

        if (
            (firstName !== undefined &&
                (typeof firstName !== "string" || firstName.trim().length > 50)) ||
            (lastName !== undefined &&
                (typeof lastName !== "string" || lastName.trim().length > 50))
        ) {
            return res.status(400).json({
                success: false,
                message: "Ім'я та прізвище повинні містити не більше 50 символів",
            });
        }

        const result = await registerUser({
            email: normalizedEmail,
            password,
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Реєстрація успішна",
            data: result,
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.statusCode === 409 || error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "Користувач із такою електронною поштою вже існує",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Помилка під час реєстрації",
        });
    }
};

// Авторизація користувача
export const login = async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Вкажіть електронну пошту та пароль",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Некоректний формат електронної пошти",
            });
        }

        if (Buffer.byteLength(password, "utf8") > 72) {
            return res.status(400).json({
                success: false,
                message: "Неправильна електронна пошта або пароль",
            });
        }

        const result = await loginUser({
            email: normalizedEmail,
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Авторизація успішна",
            data: result,
        });

    } catch (error) {
        console.error("Login error:", error);

        if (error.statusCode === 401) {
            return res.status(401).json({
                success: false,
                message: "Неправильна електронна пошта або пароль",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Помилка під час авторизації",
        });
    }
};
// Отримання інформації про поточного користувача
export const getMe = (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
};


export const updateProfile = async (req, res) => {
    const { firstName, lastName, email, phone } = req.body ?? {};
    if ([firstName, lastName, email, phone].some((value) => typeof value !== "string")) {
        return res.status(400).json({ success: false, message: "Заповніть ім’я, прізвище, email і телефон" });
    }
    const clean = [firstName.trim(), lastName.trim(), email.trim(), phone.trim()];
    const [cleanFirst, cleanLast, cleanEmail, cleanPhone] = clean;
    if (!cleanFirst || cleanFirst.length > 50 || !cleanLast || cleanLast.length > 50) {
        return res.status(400).json({ success: false, message: "Ім’я та прізвище мають містити 1–50 символів" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) {
        return res.status(400).json({ success: false, message: "Вкажіть коректну електронну пошту" });
    }
    if (!/^[+()\d\s-]{7,24}$/.test(cleanPhone)) {
        return res.status(400).json({ success: false, message: "Вкажіть коректний номер телефону" });
    }
    try {
        const user = await updateUserProfile({ userId: req.user.id, firstName: cleanFirst, lastName: cleanLast, email: cleanEmail, phone: cleanPhone });
        return res.json({ success: true, message: "Профіль оновлено", data: { user } });
    } catch (error) {
        if (error.statusCode === 409 || error.code === "P2002") {
            return res.status(409).json({ success: false, message: "Ця електронна пошта вже використовується" });
        }
        console.error("Profile update error:", error);
        return res.status(500).json({ success: false, message: "Не вдалося оновити профіль" });
    }
};
