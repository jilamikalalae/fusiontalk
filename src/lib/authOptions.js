import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
          name: "credentials",
          credentials: {},
          async authorize(credentials, req) {

            const { email, password } = credentials;

            try {

                await connectMongoDB();
                const user = await User.findOne({ email });

                if (!user) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(password, user.password);

                if (!password){
                    return null;
                }

                return user;

            } catch(error) {
                console.log("Error: ", error)
            }
      
            }
        })
    ],
    callbacks: {
        session: async ({ session, token }) => {
          if (session?.user) {
            session.user.id = token.sub;
          }
          return session;
        },
        jwt: async ({ user, token }) => {
          if (user) {
            token.uid = user.id;
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
    }
};