// src/app/api/sensitive-texts/route.ts
import { NextResponse } from "next/server";
import { parseFormData } from "@/utils/parseFormData";
import { detectText } from "@/features/sensitive-texts/detectText";
import { generatePrompt } from "@/features/sensitive-texts/generatePrompt";
import { analyzeSensitiveTexts } from "@/features/sensitive-texts/analyzeSensitiveTexts";
import { maskImage } from "@/features/sensitive-texts/maskImage";

export const config = {
  api: {
    // Next.jsがリクエストの本文を自動解析する機構を無効化
    bodyParser: false,
  },
};

// POSTメソッドの処理
export async function POST(request: Request) {
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

    // フォームデータを解析
    const { file, inputTexts } = await parseFormData(request);

    // 画像をBuffer形式に変換
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Vision APIで文字検出
    const { textAnnotations, textContext } = await detectText(fileBuffer);

    // テキストが検出されなかった場合
    if (textAnnotations.length === 0) {
      return NextResponse.json(
        { message: "No text detected in the image." },
        { status: 200 }
      );
    }

    // Gemini用のプロンプトを生成
    const prompt = generatePrompt(textContext, inputTexts);

    // Gemini APIでマスク対象のテキストを分析
    const sensitiveTexts = await analyzeSensitiveTexts(prompt);

    // 画像にマスクを適用
    const maskedImageBuffer = await maskImage(
      fileBuffer,
      textAnnotations,
      sensitiveTexts
    );

    // マスクされた画像を返す
    return new Response(maskedImageBuffer, {
      headers: {
        "Content-Type": "image/png",
      },
    });
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
