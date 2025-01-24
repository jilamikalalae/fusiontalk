import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    async function middleware(req) {
      const token = req.nextauth.token;
  
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
  
      return NextResponse.next();
    }
  );

  export const config = {
    matcher: ['/((?!api/auth|api/register|login|register|api/meta|api/line).*)'],
  };
  
