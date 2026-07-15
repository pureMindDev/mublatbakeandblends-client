import api from "./api";

/* GET /api/products */
export const fetchProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

/* GET /api/products/:id */
export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
};

/* POST /api/products */
export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data.product;
};

/* PUT /api/products/:id */
export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data.product;
};

/*
 * PATCH /api/products/:id/toggle
 * Flips current active state — use for single product toggle only.
 */
export const toggleProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/toggle`);
  return data.product;
};

/*
 * PATCH /api/products/:id/activate
 * Always sets active = true — use for bulk activate so it never
 * accidentally re-deactivates something already active.
 */
export const activateProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/activate`);
  return data.product;
};

/*
 * PATCH /api/products/:id/deactivate
 * Always sets active = false — use for bulk deactivate.
 */
export const deactivateProduct = async (id) => {
  const { data } = await api.patch(`/products/${id}/deactivate`);
  return data.product;
};

/* DELETE /api/products/:id */
export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
