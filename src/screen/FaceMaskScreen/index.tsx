"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ImageEditor from "../../components/ImageEditor";

interface CircleData {
  x: number;
  y: number;
  radius: number;
  id: string;
}

interface FaceMaskResponse {
  imageData: string;
  circles: CircleData[];
  imageWidth: number;
  imageHeight: number;
}

export default function FaceMaskScreen() {
  type FormData = {
    file: FileList;
  };

  const [editorData, setEditorData] = useState<FaceMaskResponse | null>(null);
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

      // APIにリクエストを送信
      const response = await fetch("/api/face-mask", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the image");
      }

      // JSONレスポンスを取得
      const result: FaceMaskResponse = await response.json();
      setEditorData(result);
    } catch (error) {
      console.error("Error processing the image:", error);
      alert("Face masking service is coming soon!");
    } finally {
      setIsLoading(false);
    }
  };

  // 画像保存ハンドラー
  const handleSave = (canvas: HTMLCanvasElement) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "face-masked-image.png";
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  // 戻るボタンのハンドラー
  const handleBack = () => {
    setEditorData(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        {!editorData && !isLoading && (
          <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8">
            <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-900 tracking-wide">
              Face Mask
            </h2>

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
                <p className="text-sm text-green-800">
                  画像をアップロードすると、顔を自動検出して犬の顔でマスクします。その後、Canvas上で編集できます。
                </p>
              </div>

              {/* 実行ボタン */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 focus:ring-4 focus:ring-green-300 transition duration-300"
              >
                Detect Faces for Editing
              </button>
            </form>
          </div>
        )}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="text-center">
            <div className="bg-white shadow-2xl rounded-3xl p-8">
              <span className="text-green-500 font-bold animate-pulse text-lg">
                顔を検出中...少々お待ちください！
              </span>
            </div>
          </div>
        )}

        {/* 画像編集表示 */}
        {editorData && (
          <div className="w-full">
            <div className="mb-4 text-center">
              <button
                onClick={handleBack}
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
              >
                ← 戻る
              </button>
            </div>
            <ImageEditor
              imageData={editorData.imageData}
              initialCircles={editorData.circles}
              imageWidth={editorData.imageWidth}
              imageHeight={editorData.imageHeight}
              onSave={handleSave}
            />
          </div>
        )}
      </div>
    </div>
  );
}
