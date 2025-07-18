import vision from "@google-cloud/vision";
import { writeFileSync, existsSync } from "fs";

interface FaceAnnotation {
  boundingPoly?: {
    vertices?: Array<{
      x?: number | null;
      y?: number | null;
    }>;
  };
}

const base64Key = process.env.GOOGLE_APPLICATION_CREDENTIALS;
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

export async function detectFaces(
  fileBuffer: Buffer
): Promise<FaceAnnotation[]> {
  const visionClient = new vision.ImageAnnotatorClient();

  // 画像をGoogle Vision APIに送信して顔検出を実行
  const [detectionResult] = await visionClient.faceDetection(fileBuffer);
  const faceAnnotations = detectionResult.faceAnnotations;

  if (!faceAnnotations || faceAnnotations.length === 0) {
    return [];
  }

  return faceAnnotations as FaceAnnotation[];
}
