import { connectMongoDB } from "@/libs/mongodb";
import TodaySongs from "@/models/todaySongs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { rateLimiter } from "@/utils/rateLimit";



export async function POST(req: Request) {

    try {
      await connectMongoDB();
      const songs = await TodaySongs.find({})
        let ret:any=[]
        const len = songs.length
        songs.forEach((val,i)=>{
          const pos = len-i-1
            const temp = {
                name:songs[pos].name,
                ytUrl:songs[pos].ytUrl,
                videoTitle:songs[pos].videoTitle,
                voice:songs[pos].voice,
                s3Link:songs[pos].s3Link,
                image:songs[pos].image,
                ytThumb:songs[pos].ytThumb
            }
            ret.push(temp)
        })

      return NextResponse.json({  covers: ret },{status: 200});
    } catch (error) {
      console.log(error);
      return NextResponse.json({ err: "Something went wrong",covers:[] },{status:500});
    }
  
}
