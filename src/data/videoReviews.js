/**
 * Fallback list of the three supplied customer review videos, used ONLY when
 * the API can't be reached. Normal operation reads approved videos from
 * GET /api/video-reviews (managed in Admin → Video Reviews). Files live in
 * public/videos/ and are served from the site itself.
 * No customer names are included — none were supplied/approved.
 */
export const fallbackVideoReviews = [1, 2, 3].map((n) => ({
  _id: `local-${n}`,
  videoUrl: `/videos/customer-review-${n}.mp4`,
  posterUrl: `/videos/customer-review-${n}-poster.jpg`,
  customerName: "",
  caption: "",
}));
