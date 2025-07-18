// src/app/api/face-mask/route.ts
import { NextResponse } from "next/server";
import { loadImage } from "@napi-rs/canvas";
import { FaceMaskResponse } from "@/types/faceMask";
import { detectFaces } from "@/features/face-mask/detectFaces";
import { extractCirclesFromFaces } from "@/features/face-mask/extractCirclesFromFaces";
import { drawCircleMaskOnImage } from "@/features/face-mask/drawCircleMaskOnImage";
import { encodeImageToBase64 } from "@/features/face-mask/encodeImageToBase64";

export const config = {
  api: {
    // Next.jsがリクエストの本文を自動解析する機構を無効化
    bodyParser: false,
  },
};

// POSTメソッドの処理
export async function POST(
  request: Request
): Promise<
  | NextResponse<FaceMaskResponse | { error: string; message?: string }>
  | Response
> {
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

    // 画像をBuffer形式に変換
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Vision APIで顔検出
    const faceAnnotations = await detectFaces(fileBuffer);

    // 顔の位置から中心と半径を計算
    const circles = extractCirclesFromFaces(faceAnnotations);

    // 画像のサイズを取得
    const image = await loadImage(fileBuffer);
    const imageWidth = image.width;
    const imageHeight = image.height;

    // マスクタイプに応じて処理を分岐
    if (maskType === "circle") {
      // 白い丸で隠した画像を直接返す
      const maskedImageBuffer = await drawCircleMaskOnImage(
        fileBuffer,
        circles
      );
      return new Response(maskedImageBuffer, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    } else {
      // JSONデータを返す（デフォルト）
      const imageData = encodeImageToBase64(fileBuffer, file.type);
      const response: FaceMaskResponse = {
        imageData: imageData,
        circles: circles,
        imageWidth: imageWidth,
        imageHeight: imageHeight,
      };

      return NextResponse.json(response, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing the image.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
