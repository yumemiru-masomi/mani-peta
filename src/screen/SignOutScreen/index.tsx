"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface SignOutScreenProps {
  onClose?: () => void;
}

export default function SignOutScreen({ onClose }: SignOutScreenProps) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.history.back();
    }
  };

  return (
    <>
      {/* 閉じるボタン（右上） */}
      <button
        aria-label="閉じる"
        className="absolute top-4 right-4 text-white"
        onClick={handleClose}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* メニュー内容 */}
      <SignOutButton />
    </>
  );
}
