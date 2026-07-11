import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.provider = token.provider;
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
