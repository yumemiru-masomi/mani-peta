// src/app/page.tsx
"use client";
import Image from "next/image";
import { useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";

export default function Home() {
  type FormData = {
    file: FileList;
    maskTexts: { text: string }[];
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Formの初期化
  const {
    register, // 入力フィールドをRHFに登録
    handleSubmit,
    control, // フォーム送信時の関数
    reset,
  } = useForm<FormData>({
    defaultValues: {
      maskTexts: [{ text: "" }],
    },
  });

  // useFieldArrayで動的なフィールドを管理
  const { fields, append, remove } = useFieldArray({
    control,
    name: "maskTexts",
  });

  const onSubmit = async (data: FormData) => {
    const { file, maskTexts } = data;

    if (!file || !maskTexts) {
      alert("Please upload an image and enter text to mask.");
      return;
    }

    // 選択されたファイルを取得
    try {
      setIsLoading(true);

      // FormDataにファイルを追加
      const formData = new FormData();
      const fileItem = file[0];
      formData.append("file", fileItem);
      formData.append("maskTexts", JSON.stringify(maskTexts));

      // APIにリクエストを送信
      const response = await fetch("/api/sensitive-texts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the image");
      }

      // 加工された画像を取得してプレビュー表示
      const blob = await response.blob();
      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error("Error processing the image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 tracking-wide">
          Mask Sensitive Text
        </h1>
        {!imagePreview && !isLoading && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ファイルアップロード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("file")}
                className="block w-full text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 focus:outline-none p-3 shadow-sm transition-transform transform hover:scale-105"
              />
            </div>
            {/* テキスト入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to Mask
              </label>
              {fields.map((field: { id: string }, index: number) => (
                <div key={field.id} className="mb-4">
                  <div className="flex items-center space-x-4">
                    {/* 入力フィールド */}
                    <input
                      type="text"
                      placeholder={`Enter text to mask ${index + 1}`}
                      {...register(`maskTexts.${index}.text` as const)}
                      className="flex-1 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 focus:outline-none p-3 shadow-sm"
                    />
                    {/* マイナスボタン: 最後以外の全てのフィールドに表示 */}
                    {fields.length > 1 && index < fields.length - 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)} // フィールドを削除
                        className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 transition-transform transform hover:scale-105 shadow flex items-center justify-center"
                      >
                        −
                      </button>
                    )}
                    {/* プラスボタン: 最後のフィールドにのみ表示 */}
                    {index === fields.length - 1 && (
                      <button
                        type="button"
                        onClick={() => append({ text: "" })} // 新しいフィールドを追加
                        className="bg-blue-500 text-white w-10 h-10 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105 shadow flex items-center justify-center"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* 実行ボタン */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 focus:ring-4 focus:ring-blue-300 transition duration-300"
            >
              Execute Masking
            </button>
          </form>
        )}
        {/* ローディング表示 */}
        {isLoading && (
          <div className="text-center mt-4">
            <span className="text-blue-500 font-bold loading-text">
              ちょっと待っててね！考えてるから！
            </span>
          </div>
        )}
        {/* プレビュー表示 */}
        {imagePreview && (
          <div className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              できたよ！お待たせ！これでいい？
            </h2>
            <Image
              src={imagePreview}
              alt="Selected Preview"
              width={500}
              height={300}
              className="rounded-xl shadow-md border border-gray-200"
            />
            <div className="flex justify-center mt-4 space-x-4">
              {/* 保存ボタン */}
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = imagePreview;
                  link.download = "masked-image.png"; // ファイル名を指定
                  link.click();
                }}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
              >
                保存する
              </button>
              {/* 閉じるボタン */}
              <button
                onClick={() => {
                  setImagePreview(null); // プレビューを閉じる
                  reset({
                    maskTexts: [{ text: "" }], // フォームの値をリセット
                  });
                }}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .loading-text {
          animation: fadeInOut 1.5s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
