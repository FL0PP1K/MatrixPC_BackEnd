import { prisma } from "../src/config/prisma.js";

try {
    const result = await prisma.$queryRaw`
        SELECT
            current_database() AS database_name,
            current_user AS db_user;
    `;

    console.log("Database connection successful!");
    console.log(result[0]);
} catch (error) {
    console.error("Database connection failed:");
    console.error(error);
    process.exitCode = 1;
} finally {
    await prisma.$disconnect();
}