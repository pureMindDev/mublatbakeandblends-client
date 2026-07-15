import api from "./api";

/**
 * Upload up to 3 images to Cloudinary via the backend.
 * @param {File[]} files - array of File objects
 * @returns {string[]} array of Cloudinary image URLs
 */
export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const { data } = await api.post("/upload/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.urls; // array of Cloudinary URLs
};

/**
 * Delete an image from Cloudinary via the backend.
 * @param {string} publicId - the Cloudinary public_id of the image
 */
export const deleteImage = async (publicId) => {
  const { data } = await api.delete("/upload/image", {
    data: { publicId },
  });
  return data;
};
