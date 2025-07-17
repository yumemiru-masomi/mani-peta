export function encodeImageToBase64(
  fileBuffer: Buffer,
  mimeType: string
): string {
  const imageBase64 = fileBuffer.toString("base64");
  return `data:${mimeType};base64,${imageBase64}`;
}
