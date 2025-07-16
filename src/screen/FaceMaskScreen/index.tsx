"use client";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Header from "@/components/Header";

export default function FaceMaskScreen() {
  type FormData = {
    file: FileList;
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Formの初期化
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const { file } = data;

    if (!file) {
      alert("Please upload an image.");
      return;
    }

    try {
      setIsLoading(true);

      // FormDataにファイルを追加
      const formData = new FormData();
      const fileItem = file[0];
      formData.append("file", fileItem);

      // APIにリクエストを送信（将来的に実装予定）
      const response = await fetch("/api/face-mask", {
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
      alert("Face masking service is coming soon!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100">
      <Header currentPage="face" />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-8">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8">
          <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-wide">
            Face Mask
          </h2>
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
                  className="block w-full text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 focus:outline-none p-3 shadow-sm transition-transform transform hover:scale-105"
                />
              </div>

              {/* 説明文 */}
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-green-800">説明</p>
              </div>

              {/* 実行ボタン */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 focus:ring-4 focus:ring-green-300 transition duration-300"
              >
                Hide Faces
              </button>
            </form>
          )}

          {/* ローディング表示 */}
          {isLoading && (
            <div className="text-center mt-4">
              <span className="text-green-500 font-bold animate-fadeInOut">
                顔を検出中...少々お待ちください！
              </span>
            </div>
          )}

          {/* プレビュー表示 */}
          {imagePreview && (
            <div className="mt-8 bg-gray-50 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                完了！顔がマスクされました！
              </h3>
              <Image
                src={imagePreview}
                alt="Face Masked Preview"
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
                    link.download = "face-masked-image.png";
                    link.click();
                  }}
                  className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  保存する
                </button>
                {/* 閉じるボタン */}
                <button
                  onClick={() => {
                    setImagePreview(null);
                    reset();
                  }}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
                >
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
