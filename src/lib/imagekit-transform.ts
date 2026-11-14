const IMAGEKIT_HOSTS = ["https://ik.imagekit.io/", "http://ik.imagekit.io/"];

export function isImagekitUrl(url: string): boolean {
  return IMAGEKIT_HOSTS.some((h) => url.startsWith(h));
}

export function buildTransform(w: number): string {
  return `w-${w},q-80,f-auto`;
}

export function withTransform(url: string, w: number): string {
  if (!isImagekitUrl(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=${buildTransform(w)}`;
}