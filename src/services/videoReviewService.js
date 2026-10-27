import axios from "axios";
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

/**
 * Uploads the file straight from the browser to Cloudinary (one-time signature
 * from our server), then registers it as an UNAPPROVED video review.
 * Large files never go through our API, so host body-size limits don't apply.
 */
export const uploadVideoReview = async (file, fields = {}, onProgress) => {
  const { data: sig } = await api.get("/video-reviews/upload-signature");

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", sig.timestamp);
  fd.append("folder", sig.folder);
  fd.append("signature", sig.signature);

  let uploaded;
  try {
    ({ data: uploaded } = await axios.post(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`,
      fd,
      {
        timeout: 0,
        onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
      }
    ));
  } catch (e) {
    const msg = e.response?.data?.error?.message;
    throw new Error(msg ? `Cloudinary: ${msg}` : "The video could not be uploaded to Cloudinary.");
  }

  return addVideoReviewUrl({
    videoUrl: uploaded.secure_url,
    cloudinaryId: uploaded.public_id,
    customerName: fields.customerName || "",
    caption: fields.caption || "",
  });
};

export const updateVideoReview = async (id, patch) => {
  const { data } = await api.patch(`/video-reviews/${id}`, patch);
  return data.video;
};

export const deleteVideoReview = async (id) => {
  const { data } = await api.delete(`/video-reviews/${id}`);
  return data;
};
