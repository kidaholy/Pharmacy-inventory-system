import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/register');
      
      if (!isLoggedIn && !isAuthPage) {
        return false; // Redirect unauthenticated users to login page
      }
      
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;