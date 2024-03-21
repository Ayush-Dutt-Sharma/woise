import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { connectMongoDB } from "@/libs/mongodb";
import UserToken from "@/models/usersToken";
import { NextResponse } from "next/server";
import { rateLimiter } from "@/utils/rateLimit";

export const options: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      if (profile && profile.email) {
        const { success } = await rateLimiter.limit(profile.email);
        if (!success) {
          NextResponse.json({err:'TOO_MANY_REQUESTS'})
          return false
        }
        await connectMongoDB();
        const isUser = await UserToken.findOne({ email: profile?.email });
        if (!isUser) {
          await UserToken.create({
            name: profile?.name,
            email: profile?.email,
            token: Number(process.env.DAILY_TOKEN),
            lastUsed: new Date().toString(),
          });
        }
      }
      return true;
    },
  },
};
