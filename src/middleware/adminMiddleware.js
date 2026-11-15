export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Доступ дозволено лише адміністратору",
        });
    }

    next();
};