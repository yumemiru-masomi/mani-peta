import { handleSignIn } from "../../app/actions/auth";

export function SignInButton() {
  return (
    <form action={handleSignIn}>
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-lg"
      >
        Sign in with Google
      </button>
    </form>
  );
}
