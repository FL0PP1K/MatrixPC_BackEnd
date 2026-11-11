import { createUserOrder, listUserOrders } from "../services/orderService.js";
export async function getMyOrders(req, res) {
  try { return res.json({ success: true, data: await listUserOrders(req.user.id) }); }
  catch (error) { console.error("Order history error:", error); return res.status(500).json({ success: false, message: "Не вдалося завантажити замовлення" }); }
}
export async function createOrder(req, res) {
  try {
    const order = await createUserOrder(req.user, req.body ?? {});
    return res.status(201).json({ success: true, message: "Замовлення оформлено", data: order });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 500) console.error("Create order error:", error);
    return res.status(status).json({ success: false, message: status === 500 ? "Не вдалося оформити замовлення" : error.message });
  }
}
