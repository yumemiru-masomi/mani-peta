"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [maskedImage, setMaskedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/mask-sensitive-text", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setMaskedImage(data.imageUrl);
      } else {
        alert("Error processing image.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-800">
          Mask Sensitive Text
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-2 px-4 text-white rounded-lg transition duration-300 ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing ? "Processing..." : "Upload and Mask"}
          </button>
        </form>
        {isProcessing && (
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {maskedImage && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800">
              Processed Image:
            </h2>
            <div className="mt-4">
              <Image
                src={maskedImage}
                alt="Masked result"
                className="rounded-lg shadow-md"
                width={300}
                height={300}
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
