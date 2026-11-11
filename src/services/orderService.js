import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma.js";

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const deliveryMethods = new Set(["branch", "address", "pickup"]);
const carriers = new Set(["nova_poshta", "ukrposhta"]);
const paymentMethods = new Set(["card", "bank_transfer", "cod", "installment"]);

export async function listUserOrders(userId) {
  return prisma.order.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: "desc" } });
}

export async function createUserOrder(user, input) {
  const { items, deliveryMethod, carrier, deliveryAddress, paymentMethod } = input;
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw fail("Кошик порожній або містить забагато товарів");
  if (!deliveryMethods.has(deliveryMethod)) throw fail("Оберіть спосіб доставки");
  if (!paymentMethods.has(paymentMethod)) throw fail("Оберіть спосіб оплати");
  if (deliveryMethod !== "pickup" && !carriers.has(carrier)) throw fail("Оберіть перевізника");
  if (deliveryMethod !== "pickup" && (typeof deliveryAddress !== "string" || deliveryAddress.trim().length < 3 || deliveryAddress.trim().length > 300)) throw fail("Вкажіть відділення або адресу доставки");
  if (!user.firstName || !user.lastName || !user.email || !user.phone) throw fail("Заповніть контактні дані у профілі перед оформленням");
  const requested = new Map();
  for (const item of items) {
    if (typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw fail("Некоректний товар або кількість");
    requested.set(item.productId, (requested.get(item.productId) || 0) + item.quantity);
  }
  const ids = [...requested.keys()];
  const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
  if (products.length !== ids.length) throw fail("Один або кілька товарів більше недоступні", 409);
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = ids.map((id) => {
    const product = byId.get(id), quantity = requested.get(id);
    if (product.stock < quantity) throw fail(`Недостатньо товару «${product.name}» на складі`, 409);
    const cents = Math.round(Number(product.price) * 100);
    return { product, quantity, cents, lineCents: cents * quantity };
  });
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineCents, 0);
  const orderNumber = `MPC-${Date.now()}-${randomBytes(2).toString("hex").toUpperCase()}`;
  return prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const updated = await tx.product.updateMany({ where: { id: line.product.id, isActive: true, stock: { gte: line.quantity } }, data: { stock: { decrement: line.quantity } } });
      if (updated.count !== 1) throw fail(`Товар «${line.product.name}» щойно закінчився`, 409);
    }
    return tx.order.create({
      data: {
        orderNumber, userId: user.id, customerName: `${user.firstName} ${user.lastName}`, customerEmail: user.email, customerPhone: user.phone,
        deliveryMethod, carrier: deliveryMethod === "pickup" ? null : carrier, deliveryAddress: deliveryMethod === "pickup" ? null : deliveryAddress.trim(), paymentMethod,
        subtotal: (subtotalCents / 100).toFixed(2), total: (subtotalCents / 100).toFixed(2),
        items: { create: lines.map(({ product, quantity, cents, lineCents }) => ({ productId: product.id, productName: product.name, productSku: product.sku, quantity, unitPrice: (cents / 100).toFixed(2), lineTotal: (lineCents / 100).toFixed(2) })) },
      }, include: { items: true },
    });
  });
}
