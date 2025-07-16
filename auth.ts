import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Check for required environment variables
const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.warn(
    "Missing required environment variables: AUTH_GOOGLE_ID and/or AUTH_GOOGLE_SECRET"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // ✅ サインアウト後は /auth/signout に遷移
      if (
        url.includes("/auth/signout") ||
        url === baseUrl ||
        url === `${baseUrl}/`
      ) {
        return `${baseUrl}/auth/signin`;
      }

      // ✅ サインイン成功後（callback経由）→ 今日のページに遷移
      if (url.includes("/auth/signin")) {
        return `${baseUrl}/text`;
      }

      // ✅ その他はそのまま
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
