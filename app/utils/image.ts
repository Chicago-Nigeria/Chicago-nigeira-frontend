export const IMAGE_CONFIG = {
  post: { aspect: 4 / 5, width: 1200, height: 1500 },
  event: { aspect: 16 / 9, width: 1200, height: 675 },
  listing: { aspect: 1, width: 1000, height: 1000 },
  profile: { aspect: 1, width: 500, height: 500 },
  header: { aspect: 3, width: 1500, height: 500 },
  message: { aspect: 1, width: 1000, height: 1000 },
} as const;

export type ImageContentType = keyof typeof IMAGE_CONFIG;

/**
 * Insert a width-based resize into a Cloudinary URL for responsive loading.
 * Falls back to the original URL if it's not a Cloudinary URL.
 */
export function cloudinaryUrl(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

/**
 * Generate a `sizes` attribute string for responsive images.
 */
export function imageSizes(mobile: string, desktop: string): string {
  return `(max-width: 768px) ${mobile}, ${desktop}`;
}
