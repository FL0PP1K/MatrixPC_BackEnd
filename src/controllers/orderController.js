import {
    createUserOrder,
    listUserOrders,
    listAllOrders,
    updateOrderStatus,
} from "../services/orderService.js";
// Історія замовлень користувача
export async function getMyOrders(req, res) {
  try {
      return res.json({
          success: true,
          data: await listUserOrders(req.user.id),
      });
  } catch (error) {
      console.error("Order history error:", error);

      return res.status(500).json({
          success: false,
          message: "Не вдалося завантажити замовлення",
      });
  }
}

// Створення замовлення
export async function createOrder(req, res) {
  try {
      const order = await createUserOrder(req.user, req.body ?? {});

      return res.status(201).json({
          success: true,
          message: "Замовлення оформлено",
          data: order,
      });
  } catch (error) {
      const status = error.statusCode || 500;

      if (status === 500) {
          console.error("Create order error:", error);
      }

      return res.status(status).json({
          success: false,
          message: status === 500
              ? "Не вдалося оформити замовлення"
              : error.message,
      });
  }
}

// Отримання всіх замовлень для адміністратора
export async function getAllOrders(req, res) {
  try {
      const orders = await listAllOrders();

      return res.json({
          success: true,
          data: orders,
      });
  } catch (error) {
      console.error("Admin orders error:", error);

      return res.status(500).json({
          success: false,
          message: "Не вдалося завантажити замовлення",
      });
  }
}

// Статуси замовлень
const allowedStatuses = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
];

// Зміна статусу адміністратором
export async function changeOrderStatus(req, res) {
    try {
        const { status } = req.body ?? {};

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Некоректний статус замовлення",
            });
        }

        const order = await updateOrderStatus(
            req.params.id,
            status
        );

        return res.json({
            success: true,
            message: "Статус замовлення оновлено",
            data: order,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Замовлення не знайдено",
            });
        }

        console.error("Update order status error:", error);

        return res.status(500).json({
            success: false,
            message: "Не вдалося оновити статус замовлення",
        });
    }
}
