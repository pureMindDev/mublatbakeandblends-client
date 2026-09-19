/**
 * Resize + re-compress an image file in the browser before it's uploaded.
 *
 * Phone camera photos are commonly 3-8MB at 3000px+ across. None of that
 * extra resolution is useful for a product photo, and uploading the full
 * original is what makes "adding an image" feel slow — the wait is almost
 * entirely the time spent pushing those extra megabytes up the user's
 * connection, before the file even reaches the server.
 *
 * This draws the image onto a canvas capped at `maxDimension` on its
 * longest edge and re-encodes it as JPEG at `quality`, which typically
 * takes a multi-MB photo down to a few hundred KB with no visible quality
 * loss for a web product image — so uploads finish in a fraction of the time.
 *
 * Falls back to returning the original file untouched if anything about
 * compression fails (e.g. an unsupported format) or if the file is already
 * small, so this can never make an upload worse.
 */
export async function compressImage(file, { maxDimension = 1600, quality = 0.82 } = {}) {
  // Already small enough (e.g. a small PNG icon/graphic) — don't bother.
  if (!file.type.startsWith("image/") || file.size < 300 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;

    // Keep going only if we actually saved meaningful size.
    if (blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Any failure (unsupported format, browser quirk, etc.) — just upload
    // the original rather than blocking the user.
    return file;
  }
}
