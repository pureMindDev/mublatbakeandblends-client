import api from "./api";

/**
 * POST /api/orders — called from Checkout when Stripe is not yet set up
 * (fallback direct order creation)
 */
export const createOrder = async (orderData) => {
  const { data } = await api.post("/orders", orderData);
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
 * DELETE /api/orders/:id  (admin only)
 */
export const deleteOrder = async (id) => {
  const { data } = await api.delete(`/orders/${id}`);
  return data;
};