/**
 * Calculates the relative luminance of a hex color.
 */
function getLuminance(hex: string): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

  const getRGB = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  return 0.2126 * getRGB(r) + 0.7152 * getRGB(g) + 0.0722 * getRGB(b);
}

/**
 * Returns "black" or "white" based on the background color's lightness.
 */
export function getContrastColor(hex: string): 'black' | 'white' {
  if (!hex || !hex.startsWith('#')) return 'black';
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? 'black' : 'white';
}
