import api from "./api";

/**
 * POST /api/orders — called from Checkout for the bank-transfer flow.
 * Backend generates the order number, sets paymentStatus: "Pending", and
 * sends the order-received + admin-notification emails.
 */
export const createOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
  return data.order;
};

/**
 * GET /api/orders/track/:orderId — PUBLIC.
 * Used by the Success page to fetch the authoritative order (number, total,
 * payment status, bank transfer state) from the server, instead of trusting
 * whatever was passed through client-side navigation state.
 */
export const fetchOrderByOrderId = async (orderId) => {
  const { data } = await api.get(`/orders/track/${encodeURIComponent(orderId)}`);
  return data.order;
};

/**
 * GET /api/orders  (admin only)
 * @param {object} params - { status, search, page, limit }
 */
export const fetchOrders = async (params = {}) => {
  const { data } = await api.get("/orders", { params });
  return data; // { type, total, page, totalPages, orders }
};

/**
 * GET /api/orders/stats  (admin only)
 */
export const fetchOrderStats = async () => {
  const { data } = await api.get("/orders/stats");
  return data.stats;
};

/**
 * GET /api/orders/:id  (admin only)
 */
export const fetchOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.order;
};

/**
 * PATCH /api/orders/:id/status  (admin only)
 */
export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data.order;
};

/**
 * PATCH /api/orders/:id/payment  (admin only)
 * The ONLY way to move an order's paymentStatus from "Pending" to "Paid".
 * Triggers the payment-confirmation email on the backend.
 */
export const markOrderAsPaid = async (id) => {
  const { data } = await api.patch(`/orders/${id}/payment`, { paymentStatus: "Paid" });
  return data.order;
};

/**
 * DELETE /api/orders/:id  (admin only)
 */
export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};