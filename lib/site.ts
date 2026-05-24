export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://docs.ssdev.space"
    : "http://localhost:3000");

export const basePath = process.env.NODE_ENV === "production" ? "/beetroot" : "";

export function withBasePath(path: string) {
  if (!path.startsWith("/")) {
    return `${basePath}/${path}`;
  }

  return `${basePath}${path}`;
}
