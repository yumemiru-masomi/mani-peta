import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// AIに返すレスポンスのスキーマを定義
const schema = {
  description: "List of sensitive texts",
  type: SchemaType.OBJECT,
  properties: {
    sensitiveTexts: {
      type: SchemaType.ARRAY,
      description: "Array of sensitive text strings",
      items: {
        type: SchemaType.STRING,
      },
    },
  },
  required: ["sensitiveTexts"],
};

export async function analyzeSensitiveTexts(prompt: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI;
  if (!apiKey) {
    throw new Error("Environment variable GOOGLE_GENERATIVE_AI is not set.");
  }

  const generativeAIClient = new GoogleGenerativeAI(apiKey);

  // Generative AI モデルを取得し、レスポンスの形式を指定
  const generativeModel = generativeAIClient.getGenerativeModel({
    model: "models/gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  // Generative AI にプロンプトを送信して結果を取得
  const aiResponse = await generativeModel.generateContent(prompt);
  const responseText = aiResponse.response.text();

  // レスポンスをJSONとして解析し、sensitiveTextsを取得
  const { sensitiveTexts } = JSON.parse(responseText);

  return sensitiveTexts;
}
