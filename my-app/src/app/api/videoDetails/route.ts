import { connectMongoDB } from "@/libs/mongodb";
import UserToken from "@/models/usersToken";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { rateLimiter } from "@/utils/rateLimit";
import { getYouTubeVideoId, getYTLength } from "@/utils/voiceChangerUtils";


interface Body {
  url: string;
}

async function getDuration(body: Body) {
  const videoId: any = getYouTubeVideoId(body?.url);
  if (videoId) {
    const duration = await getYTLength(videoId);
    if (duration) {
      return NextResponse.json({
        duration,
      });
    } else {
      return NextResponse.json({
       
        err: "URL is not correct",
      },{ status: 500});
    }
  } else {
    return NextResponse.json({
      
      err: "URL is not correct",
    },{status: 500});
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(options);
  if (session && session.user && session.user.email) {
    const { success } = await rateLimiter.limit(session.user.email);
    if (!success) {
      return NextResponse.json({  err: "TOO_MANY_REQUESTS" },{status: 500});
    }

    try {
      await connectMongoDB();
      // await req.json()
      let passedValue = await new Response(req.body).text();
      let body = JSON.parse(passedValue);
      const user = await UserToken.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({
          
          err: "User not found",
        },{status: 500});
      }
      const { token } = user;
      const isOneDayOld =
        Number(process.env.ONE_DAY_SECONDS) <
        (new Date().getTime() - new Date(user.lastUsed).getTime()) / 1000;
      if (isOneDayOld && [...[process.env.ADMIN]].includes(session.user.email)) {
        return await getDuration(body);
      } else {
        if (token <= 0) {
          return NextResponse.json({ err: "You are out of tokens" });
        } else if (token) {
          return await getDuration(body);
        }
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json({err: "Something went wrong" },{status:500});
    }
  } else {
    return NextResponse.json({  err: "Please login" },{status: 500});
  }
}
