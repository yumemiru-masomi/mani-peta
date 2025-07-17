"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface CircleData {
  x: number;
  y: number;
  radius: number;
  id: string;
}

interface ImageEditorProps {
  imageData: string;
  initialCircles: CircleData[];
  imageWidth: number;
  imageHeight: number;
  onCirclesChange?: (circles: CircleData[]) => void;
  onSave?: (canvas: HTMLCanvasElement) => void;
}

export default function ImageEditor({
  imageData,
  initialCircles,
  imageWidth,
  imageHeight,
  onCirclesChange,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [circles, setCircles] = useState<CircleData[]>(initialCircles);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dogFaceImage, setDogFaceImage] = useState<HTMLImageElement | null>(
    null
  );
  const [selectedDogImage, setSelectedDogImage] = useState<string>(
    "/image/IMG_8111.PNG"
  );
  const [maskType, setMaskType] = useState<"circle" | "dogface">("circle");

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // ドラッグ&ドロップ関連の状態
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);

  // 犬の顔画像のアップロードを処理
  const handleDogFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dogImg = new Image();
        dogImg.onload = () => {
          setDogFaceImage(dogImg);
        };
        dogImg.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // プリセット犬の顔画像の選択を処理
  const handlePresetDogImageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedSrc = e.target.value;
    setSelectedDogImage(selectedSrc);

    const dogImg = new Image();
    dogImg.onload = () => {
      setDogFaceImage(dogImg);
    };
    dogImg.src = selectedSrc;
  };

  // デフォルト犬の顔画像を読み込み
  useEffect(() => {
    const dogImg = new Image();
    dogImg.onload = () => {
      setDogFaceImage(dogImg);
    };
    // デフォルトの犬の顔画像（public/image配下の犬の写真）
    dogImg.src = selectedDogImage;
  }, [selectedDogImage]);

  // 画像を読み込み
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);

      // Canvas表示サイズを計算（最大800px幅に収まるようにスケール）
      const maxWidth = 800;
      const maxHeight = 600;

      let displayWidth = imageWidth;
      let displayHeight = imageHeight;

      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }

      if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth = displayWidth * ratio;
      }

      setCanvasSize({ width: displayWidth, height: displayHeight });
    };
    img.src = imageData;
  }, [imageData, imageWidth, imageHeight]);

  // Canvasを描画
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas実際のサイズを設定（高解像度対応）
    canvas.width = imageWidth;
    canvas.height = imageHeight;

    // Canvas表示サイズを設定
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    // 画像を描画
    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);

    // マスクを描画（白い丸または犬の顔画像）
    circles.forEach((circle) => {
      if (maskType === "dogface" && dogFaceImage) {
        // 犬の顔画像を円形にクリップ
        ctx.save();
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.clip();

        // 犬の顔画像を描画
        const imageSize = circle.radius * 2;
        ctx.drawImage(
          dogFaceImage,
          circle.x - circle.radius,
          circle.y - circle.radius,
          imageSize,
          imageSize
        );
        ctx.restore();
      } else {
        // 白い丸を描画
        ctx.fillStyle = "white";
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }

      // 選択時の境界線
      if (selectedCircleId === circle.id) {
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // 選択された円にはリサイズハンドルを表示
      if (selectedCircleId === circle.id) {
        const handleSize = 6;
        // 右側にハンドルを配置
        const handleX = circle.x + circle.radius;
        const handleY = circle.y;

        ctx.fillStyle = "#4ade80";
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(handleX, handleY, handleSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });
  }, [
    image,
    dogFaceImage,
    circles,
    imageWidth,
    imageHeight,
    canvasSize,
    selectedCircleId,
    maskType,
  ]);

  // 描画実行
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 親コンポーネントに変更を通知
  useEffect(() => {
    onCirclesChange?.(circles);
  }, [circles, onCirclesChange]);

  // 座標変換ヘルパー（表示座標→実際の画像座標）
  const getActualCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = imageWidth / rect.width;
      const scaleY = imageHeight / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [imageWidth, imageHeight]
  );

  // 指定座標の円を検索
  const findCircleAt = useCallback(
    (x: number, y: number): CircleData | null => {
      // 後ろから検索（上に描画された円を優先）
      for (let i = circles.length - 1; i >= 0; i--) {
        const circle = circles[i];
        const distance = Math.sqrt((x - circle.x) ** 2 + (y - circle.y) ** 2);
        if (distance <= circle.radius) {
          return circle;
        }
      }
      return null;
    },
    [circles]
  );

  // 指定座標のリサイズハンドルを検索
  const findResizeHandleAt = useCallback(
    (x: number, y: number): CircleData | null => {
      if (!selectedCircleId) return null;

      const selectedCircle = circles.find((c) => c.id === selectedCircleId);
      if (!selectedCircle) return null;

      const handleX = selectedCircle.x + selectedCircle.radius;
      const handleY = selectedCircle.y;
      const handleSize = 6;

      const distance = Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2);
      if (distance <= handleSize) {
        return selectedCircle;
      }

      return null;
    },
    [circles, selectedCircleId]
  );

  // マウスダウンイベント
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getActualCoordinates(e.clientX, e.clientY);

      // まずリサイズハンドルをチェック
      const resizeHandle = findResizeHandleAt(x, y);
      if (resizeHandle) {
        setIsResizing(true);
        return;
      }

      // 次に円自体をチェック
      const clickedCircle = findCircleAt(x, y);
      if (clickedCircle) {
        setSelectedCircleId(clickedCircle.id);
        setIsDragging(true);
        setDragOffset({
          x: x - clickedCircle.x,
          y: y - clickedCircle.y,
        });
      } else {
        setSelectedCircleId(null);
      }
    },
    [getActualCoordinates, findCircleAt, findResizeHandleAt]
  );

  // マウス移動イベント
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getActualCoordinates(e.clientX, e.clientY);

      if (isResizing && selectedCircleId) {
        // リサイズ中
        const selectedCircle = circles.find((c) => c.id === selectedCircleId);
        if (selectedCircle) {
          const distance = Math.sqrt(
            (x - selectedCircle.x) ** 2 + (y - selectedCircle.y) ** 2
          );
          const newRadius = Math.max(10, Math.min(200, distance));

          setCircles((prevCircles) =>
            prevCircles.map((circle) =>
              circle.id === selectedCircleId
                ? { ...circle, radius: newRadius }
                : circle
            )
          );
        }
      } else if (isDragging && selectedCircleId) {
        // ドラッグ中
        setCircles((prevCircles) =>
          prevCircles.map((circle) =>
            circle.id === selectedCircleId
              ? {
                  ...circle,
                  x: x - dragOffset.x,
                  y: y - dragOffset.y,
                }
              : circle
          )
        );
      }
    },
    [
      isDragging,
      isResizing,
      selectedCircleId,
      getActualCoordinates,
      dragOffset,
      circles,
    ]
  );

  // マウスアップイベント
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // マウスリーブイベント
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // マウスホイールイベント（サイズ変更）
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault(); // ページのスクロールを防ぐ

      const { x, y } = getActualCoordinates(e.clientX, e.clientY);
      const hoveredCircle = findCircleAt(x, y);

      if (hoveredCircle) {
        const delta = -e.deltaY; // 上スクロールで拡大、下スクロールで縮小
        const scaleFactor = delta > 0 ? 1.1 : 0.9;

        setCircles((prevCircles) =>
          prevCircles.map((circle) =>
            circle.id === hoveredCircle.id
              ? {
                  ...circle,
                  radius: Math.max(
                    10,
                    Math.min(200, circle.radius * scaleFactor)
                  ), // 10px～200pxの範囲
                }
              : circle
          )
        );

        // ホイール操作時は該当する円を選択状態にする
        setSelectedCircleId(hoveredCircle.id);
      }
    },
    [getActualCoordinates, findCircleAt]
  );

  // 右クリックイベント（新しい円を追加）
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault(); // 右クリックメニューを防ぐ

      const { x, y } = getActualCoordinates(e.clientX, e.clientY);

      // 画像の境界内かチェック
      if (x >= 0 && x <= imageWidth && y >= 0 && y <= imageHeight) {
        const newCircle: CircleData = {
          x: x,
          y: y,
          radius: 50, // デフォルトサイズ
          id: `circle-${Date.now()}`, // 一意なID
        };

        setCircles((prevCircles) => [...prevCircles, newCircle]);
        setSelectedCircleId(newCircle.id);
      }
    },
    [getActualCoordinates, imageWidth, imageHeight]
  );

  // 選択中の円を削除
  const deleteSelectedCircle = useCallback(() => {
    if (selectedCircleId) {
      setCircles((prevCircles) =>
        prevCircles.filter((circle) => circle.id !== selectedCircleId)
      );
      setSelectedCircleId(null);
    }
  }, [selectedCircleId]);

  // キーボードイベント（Delete キー）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedCircle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedCircle]);

  // PNG形式で保存
  const handleSavePNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `face-masked-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  // JPEG形式で保存
  const handleSaveJPEG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `face-masked-${Date.now()}.jpg`;
          link.click();
          URL.revokeObjectURL(url);
        }
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        {/* ツールバー */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            画像編集（
            {maskType === "dogface" ? "犬の顔でマスク" : "白い丸でマスク"}）
          </h3>
          <div className="space-x-2">
            <button
              onClick={deleteSelectedCircle}
              disabled={!selectedCircleId}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              削除
            </button>
            <button
              onClick={handleSavePNG}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
            >
              PNG保存
            </button>
            <button
              onClick={handleSaveJPEG}
              className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105"
            >
              JPEG保存
            </button>
          </div>
        </div>

        {/* マスクタイプ選択 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            マスクタイプを選択
          </h4>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="maskType"
                value="circle"
                checked={maskType === "circle"}
                onChange={(e) =>
                  setMaskType(e.target.value as "circle" | "dogface")
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">白い丸</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="maskType"
                value="dogface"
                checked={maskType === "dogface"}
                onChange={(e) =>
                  setMaskType(e.target.value as "circle" | "dogface")
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">犬の顔画像</span>
            </label>
          </div>
        </div>

        {/* 犬の顔画像選択（犬の顔画像モードの時のみ表示） */}
        {maskType === "dogface" && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              犬の顔画像を選択（マスクに使用）
            </h4>

            {/* プリセット犬の顔画像選択 */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                プリセット犬の顔画像
              </label>
              <select
                value={selectedDogImage}
                onChange={handlePresetDogImageChange}
                className="block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none p-2 shadow-sm"
              >
                <option value="/image/IMG_8111.PNG">犬の顔画像 1</option>
                <option value="/image/IMG_8109.PNG">犬の顔画像 2</option>
                <option value="/image/IMG_8108.PNG">犬の顔画像 3</option>
              </select>
            </div>

            {/* カスタム犬の顔画像アップロード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                または、カスタム画像をアップロード
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleDogFaceUpload}
                className="block w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none p-2 shadow-sm"
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              プリセット画像から選択するか、お好みの画像をアップロードしてマスクとして使用できます
            </p>
          </div>
        )}

        {/* Canvas */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex justify-center items-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
            onContextMenu={handleContextMenu}
          />
        </div>

        {/* 操作説明 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">操作方法:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • 左クリック:{" "}
              {maskType === "dogface" ? "犬の顔マスク" : "白い丸マスク"}
              を選択・移動
            </li>
            <li>
              • 右クリック: 新しい
              {maskType === "dogface" ? "犬の顔マスク" : "白い丸マスク"}を追加
            </li>
            <li>• マウスホイール: サイズ変更（マスクの上で）</li>
            <li>• 緑のハンドル: ドラッグでサイズ変更</li>
            <li>• Delete/Backspace: 選択中のマスクを削除</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
