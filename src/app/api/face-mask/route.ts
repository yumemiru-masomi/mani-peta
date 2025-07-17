// src/app/api/face-mask/route.ts
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

export const config = {
  api: {
    // Next.jsがリクエストの本文を自動解析する機構を無効化
    bodyParser: false,
  },
};

interface CircleData {
  x: number;
  y: number;
  radius: number;
  id: string;
}

interface FaceMaskResponse {
  imageData: string; // base64 encoded image
  circles: CircleData[];
  imageWidth: number;
  imageHeight: number;
}

// POSTメソッドの処理
export async function POST(
  request: Request
): Promise<
  | NextResponse<FaceMaskResponse | { error: string; message?: string }>
  | Response
> {
  // Google Vision API クライアントを作成
  const visionClient = new vision.ImageAnnotatorClient();

  try {
    // Content-Typeは、リクエストのデータ形式を表すヘッダー
    // Content-Typeがない場合は、400エラーを返す
    const contentType = request.headers.get("content-type");
    if (!contentType) {
      return NextResponse.json(
        { error: "No content-type header" },
        { status: 400 }
      );
    }

    // 画像データを取得
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const maskType = (formData.get("maskType") as string) || "data"; // デフォルトは"data"

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded. Please upload an image." },
        { status: 400 }
      );
    }

    // 画像をGoogle Vision APIに送信して顔検出を実行
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const [detectionResult] = await visionClient.faceDetection(fileBuffer);
    const faceAnnotations = detectionResult.faceAnnotations;

    // 元の画像をbase64に変換
    const imageBase64 = fileBuffer.toString("base64");

    // 画像のサイズを取得するために一時的にCanvasに読み込み
    const { loadImage } = await import("@napi-rs/canvas");
    const image = await loadImage(fileBuffer);
    const imageWidth = image.width;
    const imageHeight = image.height;

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

    // マスクタイプに応じて処理を分岐
    if (maskType === "circle") {
      // 白い丸で隠した画像を直接返す
      const { createCanvas } = await import("@napi-rs/canvas");
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

      const buffer = canvas.toBuffer("image/png");
      return new Response(buffer, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    } else {
      // JSONデータを返す（デフォルト）
      const response: FaceMaskResponse = {
        imageData: `data:${file.type};base64,${imageBase64}`,
        circles: circles,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
      };

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the image." },
      { status: 500 }
    );
  }
}
