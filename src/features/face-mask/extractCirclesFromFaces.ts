import { CircleData } from "@/types/faceMask";

interface FaceAnnotation {
  boundingPoly?: {
    vertices?: Array<{
      x?: number | null;
      y?: number | null;
    }>;
  };
}

export function extractCirclesFromFaces(
  faceAnnotations: FaceAnnotation[]
): CircleData[] {
  const circles: CircleData[] = [];

  if (faceAnnotations && faceAnnotations.length > 0) {
    // 検出された顔を白い丸の情報として保存
    faceAnnotations.forEach((face, index) => {
      if (face.boundingPoly && face.boundingPoly.vertices) {
        const vertices = face.boundingPoly.vertices;

        // 顔の境界から中心座標と半径を計算
        const minX = Math.min(...vertices.map((v) => v.x || 0));
        const maxX = Math.max(...vertices.map((v) => v.x || 0));
        const minY = Math.min(...vertices.map((v) => v.y || 0));
        const maxY = Math.max(...vertices.map((v) => v.y || 0));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radius = Math.max((maxX - minX) / 2, (maxY - minY) / 2) * 0.8;

        circles.push({
          x: centerX,
          y: centerY,
          radius: radius,
          id: `face-${index}`,
        });
      }
    });
  }

  return circles;
}
