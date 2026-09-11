import fs from "fs";

export const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]); // "%PDF"

/**
 * Checks if a buffer begins with the PDF magic bytes signature (%PDF at offset 0).
 */
export function hasPdfMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

/**
 * Reads the first 4 bytes of a file on disk and verifies the PDF magic bytes signature.
 */
export async function validatePdfFile(filePath) {
  let handle;
  try {
    handle = await fs.promises.open(filePath, "r");
    const buffer = Buffer.alloc(4);
    const { bytesRead } = await handle.read(buffer, 0, 4, 0);
    if (bytesRead < 4) return false;
    return hasPdfMagicBytes(buffer);
  } catch (err) {
    console.warn(`[PDF Validator] Could not read file header for ${filePath}:`, err.message);
    return false;
  } finally {
    if (handle) {
      await handle.close().catch(() => {});
    }
  }
}

