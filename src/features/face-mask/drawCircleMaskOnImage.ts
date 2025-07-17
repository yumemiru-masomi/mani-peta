import { createCanvas, loadImage } from "@napi-rs/canvas";
import { CircleData } from "@/types/faceMask";

export async function drawCircleMaskOnImage(
  fileBuffer: Buffer,
  circles: CircleData[]
): Promise<Buffer> {
  const image = await loadImage(fileBuffer);
  const imageWidth = image.width;
  const imageHeight = image.height;

  const canvas = createCanvas(imageWidth, imageHeight);
  const context = canvas.getContext("2d");

  // 元の画像を描画
  context.drawImage(image, 0, 0, imageWidth, imageHeight);

  // 検出された顔を白い丸で隠す
  circles.forEach((circle) => {
    // 白い丸を描画
    context.fillStyle = "white";
    context.beginPath();
    context.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    context.fill();

    // 白い丸の外枠を描画（オプション）
    context.strokeStyle = "#e0e0e0";
    context.lineWidth = 2;
    context.stroke();
  });

  return canvas.toBuffer("image/png");
}
