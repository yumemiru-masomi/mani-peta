import vision from "@google-cloud/vision";

interface FaceAnnotation {
  boundingPoly?: {
    vertices?: Array<{
      x?: number | null;
      y?: number | null;
    }>;
  };
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
