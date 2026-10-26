import api from "./api";

/* GET /api/video-reviews — public, approved videos only */
export const fetchVideoReviews = async () => {
  const { data } = await api.get("/video-reviews");
  return data.videos || [];
};

/* ── Admin ── */
export const fetchAllVideoReviews = async () => {
  const { data } = await api.get("/video-reviews/admin/all");
  return data.videos || [];
};

export const addVideoReviewUrl = async (payload) => {
  const { data } = await api.post("/video-reviews", payload);
  return data.video;
};

export const uploadVideoReview = async (file, fields = {}, onProgress) => {
  const fd = new FormData();
  fd.append("video", file);
  if (fields.customerName) fd.append("customerName", fields.customerName);
  if (fields.caption) fd.append("caption", fields.caption);
  const { data } = await api.post("/video-reviews/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 0,
    onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
  return data.video;
};

export const updateVideoReview = async (id, patch) => {
  const { data } = await api.patch(`/video-reviews/${id}`, patch);
  return data.video;
};

export const deleteVideoReview = async (id) => {
  const { data } = await api.delete(`/video-reviews/${id}`);
  return data;
};
