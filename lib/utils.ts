export { cn } from "cn";

/**
 * Validates whether a string is a safe and valid URL for Next.js Image component.
 * Supports absolute HTTP/HTTPS URLs and safe relative paths starting with '/'.
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Safe relative path (e.g., /logo.png, /truemoney.png)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }

  // Absolute URL verification
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
