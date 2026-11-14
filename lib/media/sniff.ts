// Identify a file from its first bytes. We never trust the filename or the
// Content-Type the browser sent -- anyone can claim "image/png" for anything.

export function sniffMime(b: Uint8Array): string | null {
  const startsWith = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (startsWith(0x47, 0x49, 0x46, 0x38) && (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61) return "image/gif";
  // WEBP = "RIFF" .... "WEBP"
  if (startsWith(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (startsWith(0x25, 0x50, 0x44, 0x46)) return "application/pdf"; // %PDF
  if (startsWith(0x00, 0x00, 0x01, 0x00)) return "image/x-icon"; // .ico
  return null;
}

// image/x-icon and image/vnd.microsoft.icon are the same format.
export function mimeMatches(declared: string, sniffed: string): boolean {
  const icon = (m: string) => m === "image/x-icon" || m === "image/vnd.microsoft.icon";
  return declared === sniffed || (icon(declared) && icon(sniffed));
}
