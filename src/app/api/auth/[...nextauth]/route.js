import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Replace with your user authentication logic
        const user = { id: "1", name: "Admin" }; // Example user
        if (credentials.username === "admin" && credentials.password === "password") {
          return user; // Authentication successful
        }
        return null; // Authentication failed
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Update to your actual sign-in page
  },
};

// NextAuth acts as the handler for the route
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
