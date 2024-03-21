import { connectMongoDB } from "@/libs/mongodb";
import UserToken from "@/models/usersToken";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { rateLimiter } from "@/utils/rateLimit";

export async function GET(req: Request) {
  const session = await getServerSession(options);
  if (session && session.user && session.user.email) {
    const { success } = await rateLimiter.limit(session.user.email);
    if (!success) {
      return NextResponse.json({  err: "TOO_MANY_REQUESTS" },{status: 500});
    }

    try {
      await connectMongoDB();
      const user = await UserToken.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({
         
          err: "User not found",
        },{ status: 500});
      }
      const { token } = user;
      const ret = {
        email: session.user.email,
        name: session.user.name,
        img: session.user.image,
        token: token,
      };

      return NextResponse.json({ user: ret },{status: 200});
    } catch (error) {
      console.log(error);
      return NextResponse.json({  err: "Something went wrong" },{status: 500});
    }
  } else {
    return NextResponse.json({  err: "Please login" },{status: 500});
  }
}
