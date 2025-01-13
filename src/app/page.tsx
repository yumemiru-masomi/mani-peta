"use client";
import Image from "next/image";

import { useState } from "react";
export default function Home() {
  // 選択された画像を保存する状態
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event || !event.target || !event.target.files) return;
    const file = event.target.files[0];
    // 選択されたファイルを取得
    if (file) {
      try {
        // FormDataにファイルを追加
        const formData = new FormData();
        formData.append("file", file);
        console.log("file", file);
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
    }
  };

  // const handleSubmit = async () => {};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Mask Sensitive Text
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
        />

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
