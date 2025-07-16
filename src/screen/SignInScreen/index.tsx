import { SignInButton } from "@/components/auth/SignInButton";

export default function SignInScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Mani Peta</h1>
        <p className="text-gray-600 mb-6">
          スクリーンショット内の個人情報をAIが自動検出し、適切にマスキングします
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
