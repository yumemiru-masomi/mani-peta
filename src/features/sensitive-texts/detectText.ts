import vision from "@google-cloud/vision";
import { writeFileSync, existsSync } from "fs";

interface TextAnnotation {
  description?: string | null;
  boundingPoly?: {
    vertices?: Array<{
      x?: number | null;
      y?: number | null;
    }>;
  } | null;
}

export interface DetectedText {
  textAnnotations: TextAnnotation[];
  detectedTexts: string[];
  textContext: string;
}

// Vercel上で実行時にGOOGLE_APPLICATION_CREDENTIALS_B64からJSONを復元
const base64Key = process.env.GOOGLE_APPLICATION_CREDENTIALS_B64;
const keyPath = "/tmp/service-account.json";

if (base64Key && !existsSync(keyPath)) {
  try {
    writeFileSync(keyPath, Buffer.from(base64Key, "base64"));
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
    console.log("✅ Service account key written to /tmp/service-account.json");
  } catch (err) {
    console.error("❌ Failed to write credentials file:", err);
  }
}

export async function detectText(fileBuffer: Buffer): Promise<DetectedText> {
  const visionClient = new vision.ImageAnnotatorClient();

  // 画像をGoogle Vision APIに送信
  const [detectionResult] = await visionClient.textDetection(fileBuffer);
  const textAnnotations = detectionResult.textAnnotations;

  if (!textAnnotations || textAnnotations.length === 0) {
    return {
      textAnnotations: [],
      detectedTexts: [],
      textContext: "",
    };
  }

  // 検出されたテキストを配列に変換
  const detectedTexts = textAnnotations
    .slice(1)
    .map((annotation) => annotation.description || "")
    .filter((text) => text !== "");

  // 検出テキストをコンマ区切りの文字列に変換
  const textContext = detectedTexts.join(", ");

  return {
    textAnnotations: textAnnotations as TextAnnotation[],
    detectedTexts,
    textContext,
  };
}
