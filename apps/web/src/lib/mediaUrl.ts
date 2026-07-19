/** Resolve a media path returned by the API for use in <video src>. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (
    path.startsWith('blob:') ||
    path.startsWith('data:') ||
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  return `${base}${path}`;
}
