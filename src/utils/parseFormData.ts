export interface ParsedFormData {
  file: File;
  inputTexts: string[];
}

export async function parseFormData(request: Request): Promise<ParsedFormData> {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const maskTexts = formData.get("maskTexts")?.toString() ?? "[]";

  if (!file || !maskTexts) {
    throw new Error("No file uploaded. Please upload an image.");
  }

  // maskTextsをJSONパースして配列に変換
  const parsedMaskTexts: { text: string }[] = JSON.parse(maskTexts);
  const inputTexts = parsedMaskTexts
    .flatMap((item) => item.text.split(","))
    .map((text) => text.trim())
    .filter((text) => text !== "");

  return {
    file,
    inputTexts,
  };
}
