/** Accept same-site paths only, including before URL backslash normalization. */
export function safeRedirect(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return fallback;
  return value;
}
