import CredentialsProvider from "next-auth/providers/credentials";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials;
      
        if (!email || !password) {
          console.error("Missing email or password");
          return null; // Return null instead of throwing an error
        }
      
        try {
          await connectMongoDB();
      
          const user = await User.findOne({ email });
      
          if (!user) {
            console.error("Invalid email or password");
            return null; // Invalid user
          }
      
          const passwordMatch = await bcrypt.compare(password, user.password);
      
          if (!passwordMatch) {
            console.error("Invalid email or password");
            return null; // Password mismatch
          }
      
          return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null; // Handle errors gracefully
        }
      }
    }),
  ],
  callbacks: {
    // Customize the session object
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub; // Attach user ID to the session
      }

      
      return session;
    },
    // Customize the JWT object
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id; // Attach user ID to the JWT token
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", 
  },
};

export default authOptions;
