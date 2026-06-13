/**
 * Optimizes image URLs for frontend rendering.
 * If the URL is from Cloudinary, it injects resizing and optimization transformations.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @returns {string} - The optimized image URL
 */
export function getOptimizedImageUrl(url, width = 100, height = 100) {
  if (!url) return "";

  // Cloudinary image optimization
  if (url.includes("res.cloudinary.com")) {
    return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill,g_auto,q_auto,f_auto/`);
  }

  return url;
}
