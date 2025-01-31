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
<<<<<<< HEAD
    matcher: ['/((?!api/auth|api/register|login|register|api/socket|api/line).*)'],
=======
    matcher: ['/((?!api/auth|api/register|login|register|api/meta|api/line).*)'],
>>>>>>> 5cfae327f92bfdea242cfada24d6ecdb1866d932
  };
  
