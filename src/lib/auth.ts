import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt.js"; 
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [],
})