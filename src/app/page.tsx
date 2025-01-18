// src/app/page.tsx
"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function Home() {
  type FormData = {
    file: FileList; // ファイルは FileList 型
    maskText: string; // テキストは文字列型
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // React Hook Formの初期化
  const {
    register, // 入力フィールドをRHFに登録
    handleSubmit, // フォーム送信時の関数
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { file, maskText } = data; // フォームデータを取得

    console.log("maskText", maskText);
    console.log("file", file);

    if (!file || !maskText) {
      alert("Please upload an image and enter text to mask.");
      return;
    }

    // 選択されたファイルを取得
    try {
      console.log("Preparing FormData...");

      // FormDataにファイルを追加
      const formData = new FormData();
      const fileItem = file[0];
      formData.append("file", fileItem);
      console.log("file", file);
      formData.append("maskText", maskText);
      console.log("maskText", maskText);

      console.log("Sending API request...");
      // APIにリクエストを送信
      const response = await fetch("/api/sensitive-texts", {
        method: "POST",
        body: formData,
      });
      console.log("response", response);

      if (!response.ok) {
        throw new Error("Failed to process the image");
      }

      // 加工された画像を取得してプレビュー表示
      const blob = await response.blob();
      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);
    } catch (error) {
      console.error("Error processing the image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Mask Sensitive Text
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ファイルアップロード */}
          <input
            type="file"
            accept="image/*"
            {...register("file")}
            className="block w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
          {/* テキスト入力 */}
          <input
            type="text"
            placeholder="Enter text to mask"
            {...register("maskText")}
            className="block w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none mt-4"
          />
          {/* 実行ボタン */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg mt-4 hover:bg-blue-600 transition-colors"
          >
            Execute Masking
          </button>
        </form>
        {/* プレビュー表示 */}
        {imagePreview && (
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Preview:</h2>
            <Image
              src={imagePreview}
              alt="Selected Preview"
              width={500}
              height={300}
              className="rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// export default function Home() {
//   const { register, handleSubmit } = useForm<FormData>();

//   type FormData = {
//     example: string;
//   };

//   const onSubmit = (data: FormData) => {
//     console.log("Form Data:", data);
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <input {...register("example")} placeholder="Type something..." />
//       <button type="submit">Submit</button>
//     </form>
//   );
// }
