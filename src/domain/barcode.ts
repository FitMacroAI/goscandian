const VALID_BARCODE_LENGTHS = new Set([8, 12, 13, 14]);

export function normalizeBarcode(input: string): string {
  return input.replace(/\D/g, "");
}

export function isSupportedBarcode(input: string): boolean {
  const normalized = normalizeBarcode(input);
  return VALID_BARCODE_LENGTHS.has(normalized.length);
}
