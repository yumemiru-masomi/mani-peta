import { createCanvas, loadImage } from "@napi-rs/canvas";

interface TextAnnotation {
  description?: string | null;
  boundingPoly?: {
    vertices?: Array<{
      x?: number | null;
      y?: number | null;
    }>;
  } | null;
}

export async function maskImage(
  fileBuffer: Buffer,
  textAnnotations: TextAnnotation[],
  sensitiveTexts: string[]
): Promise<Buffer> {
  // 画像を読み込み
  const image = await loadImage(fileBuffer);
  const imageWidth = image.width;
  const imageHeight = image.height;

  // Canvasを作成し、画像を描画
  const canvas = createCanvas(imageWidth, imageHeight);
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, imageWidth, imageHeight);

  // コマンドライン引数からマスク対象の単語を取得
  const targetWord = process.argv[2]?.toLowerCase();

  // 検出されたテキストを繰り返し処理して、マスク対象のテキストを赤い長方形で隠す
  textAnnotations.forEach((annotation, index) => {
    if (
      index !== 0 &&
      annotation.description &&
      sensitiveTexts.includes(annotation.description) &&
      annotation.description.toLowerCase() !== targetWord
    ) {
      // テキストを囲む座標を取得
      const vertices =
        annotation.boundingPoly && annotation.boundingPoly.vertices;
      const coordinates = (vertices || []).map((vertex) => ({
        x: vertex.x || 0,
        y: vertex.y || 0,
      }));

      // 赤い長方形を塗りつぶす
      context.fillStyle = "red";
      context.beginPath();
      context.moveTo(coordinates[0].x, coordinates[0].y);
      coordinates.forEach((vertex, i: number) => {
        if (i > 0) context.lineTo(vertex.x, vertex.y);
      });
      context.closePath();
      context.fill();

      // 赤い長方形の外枠を描画
      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(coordinates[0].x, coordinates[0].y);
      coordinates.forEach((vertex, i: number) => {
        if (i > 0) context.lineTo(vertex.x, vertex.y);
      });
      context.closePath();
      context.stroke();
    }
  });

  return canvas.toBuffer("image/png");
}
