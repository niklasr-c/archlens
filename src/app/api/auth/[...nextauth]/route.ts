import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          // "repo" ist entscheidend! Damit dürfen wir auch private Repositories lesen.
          scope: "read:user user:email repo", 
        },
      },
    }),
  ],
  callbacks: {
    // Wir fangen den GitHub Access Token ab und speichern ihn im JWT (JSON Web Token)
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    // Wir machen den Token in der Frontend-Session verfügbar
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };