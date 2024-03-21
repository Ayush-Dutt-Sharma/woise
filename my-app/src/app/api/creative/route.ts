import { connectMongoDB } from "@/libs/mongodb";
import TodaySongs from "@/models/todaySongs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { rateLimiter } from "@/utils/rateLimit";



export async function GET(req: Request) {
  const session = await getServerSession(options);
  if (session && session.user && session.user.email) {
    const { success } = await rateLimiter.limit(session.user.email);
    if (!success) {
      return NextResponse.json({ err: "TOO_MANY_REQUESTS" },{status:500});
    }
    try {
      await connectMongoDB();
      const songs = await TodaySongs.find({})
        let ret:any=[]
        songs.forEach((val,i)=>{
            const temp = {
                name:songs[i].name,
                ytUrl:songs[i].ytUrl,
                videoTitle:songs[i].videoTitle,
                voice:songs[i].voice,
                s3Link:songs[i].s3Link,
                image:songs[i].image,
                ytThumb:songs[i].ytThumb
            }
            ret.push(temp)
        })

      return NextResponse.json({  covers: ret },{status: 200});
    } catch (error) {
      console.log(error);
      return NextResponse.json({ err: "Something went wrong" },{status:500});
    }
  } else {
    return NextResponse.json({  err: "Please login" },{status: 500});
  }
}
