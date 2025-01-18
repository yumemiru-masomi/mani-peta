// src/app/api/sensitive-texts/route.ts
import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFile } from "fs/promises";

export const config = {
  api: {
    // Next.jsがリクエストの本文を自動解析する機構を無効化
    bodyParser: false,
  },
};

// AIに返すレスポンスのスキーマを定義
const schema = {
  description: "List of sensitive texts", // スキーマの説明
  type: SchemaType.OBJECT, // オブジェクト型で定義
  properties: {
    sensitiveTexts: {
      type: SchemaType.ARRAY, // 配列型として定義
      description: "Array of sensitive text strings", // 配列の説明
      items: {
        type: SchemaType.STRING, // 配列要素は文字列型
      },
    },
  },
  required: ["sensitiveTexts"], // 必須プロパティを指定
};

// POSTメソッドの処理
export async function POST(request: Request) {
  // Google Vision API と Generative AI クライアントを作成
  const visionClient = new vision.ImageAnnotatorClient();
  const apiKey = process.env.GOOGLE_GENERATIVE_AI;
  if (!apiKey) {
    throw new Error("Environment variable GOOGLE_GENERATIVE_AI is not set.");
  }

  const generativeAIClient = new GoogleGenerativeAI(apiKey);

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
    console.log("🩵 Content-Type:", contentType);

    // 画像データを取得
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const maskText = formData.get("maskText")?.toString();

    if (!file || !maskText) {
      return NextResponse.json(
        { error: "No file uploaded. Please upload an image." },
        { status: 400 }
      );
    }

    console.log("🧡 File received:", file);
    console.log("💚 Mask Text received:", maskText);

    // 画像をGoogle Vision APIに送信
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const [detectionResult] = await visionClient.textDetection(fileBuffer);
    const textAnnotations = detectionResult.textAnnotations;

    console.log("fileBuffer🌟", fileBuffer);
    console.log("textAnnotations💫", textAnnotations);

    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json(
        { message: "No text detected in the image." },
        { status: 200 }
      );
    }

    // 検出されたテキストを配列に変換
    const detectedTexts = textAnnotations
      .slice(1) // 最初の要素はフルテキスト
      .map((annotation) => annotation.description);

    console.log("Extracted Text Array🥰:", detectedTexts);

    // 検出テキストをコンマ区切りの文字列に変換
    const textContext = detectedTexts.join(", ");

    // Generative AI モデルを取得し、レスポンスの形式を指定
    const generativeModel = generativeAIClient.getGenerativeModel({
      model: "models/gemini-1.5-pro", // 使用するモデル名
      generationConfig: {
        responseMimeType: "application/json", // レスポンスを JSON 形式で取得
        responseSchema: schema, // スキーマを設定
      },
    });

    // AIに渡すプロンプト
    const prompt = `以下のテキストの中から、ブログ公開時に隠したほうが良い情報を特定してください。隠すべき情報の基準は次の通りです：
  1. APIキー：アルファベットと数字が混在する長い文字列。
  2. メールアドレス：'@' を含む文字列。
  3. 電話番号：数字と '-' が含まれる形式（例: "03-1234-5678").
  4. クレジットカード番号：16桁の数字。
  5. 個人名：明らかに名前と分かるもの。
  6. 企業名やサービス名：次のような特徴を持つものを特定してください：
    - 通常1つまたは複数の単語で構成され、記号（例: '-', '.'）やアルファベットが混在する場合が多い。
    - 文脈に基づいて「特定のブランド」「会社名」「プロジェクト名」などと推測されるもの。
    - 一般的な単語（例: 'project', 'dashboard', 'add'）は含まない。
  7. 以下の文字列が含まれていたら、それは隠すべき情報としてください。
    - yumemi

  以下のテキストに基づいて、隠すべき情報を JSON 形式で返してください。
  形式: { "sensitiveTexts": ["隠すべきテキスト1", "隠すべきテキスト2"] }
  text context: ${textContext}
  以下のテキストも隠すべき情報として認識してください: "${maskText}"`;

    // Generative AI にプロンプトを送信して結果を取得
    const aiResponse = await generativeModel.generateContent(prompt);
    const responseText = aiResponse.response.text();
    console.log("AI Response:", responseText);

    // レスポンスをJSONとして解析し、sensitiveTextsを取得
    const { sensitiveTexts } = JSON.parse(responseText);
    console.log("Sensitive Texts to Mask:🔥", sensitiveTexts);

    // 隠すべきテキストをJSONファイルに保存
    await writeFile(
      "sensitiveTexts.json",
      JSON.stringify(sensitiveTexts, null, 2)
    );

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
        console.log(`Text to mask: ${annotation.description}`);

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
        coordinates.forEach((vertex, i) => {
          if (i > 0) context.lineTo(vertex.x, vertex.y);
        });
        context.closePath();
        context.fill();

        // 赤い長方形の外枠を描画
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(coordinates[0].x, coordinates[0].y);
        coordinates.forEach((vertex, i) => {
          if (i > 0) context.lineTo(vertex.x, vertex.y);
        });
        context.closePath();
        context.stroke();
      }
    });

    const buffer = canvas.toBuffer("image/png");
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the image." },
      { status: 500 }
    );
  }
}
