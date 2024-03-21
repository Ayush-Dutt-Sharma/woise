import { connectMongoDB } from "@/libs/mongodb";
import UserToken from "@/models/usersToken";
import ActiveJobs from "@/models/activeJobs";
import TodaySongs from "@/models/todaySongs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { rateLimiter } from "@/utils/rateLimit";
import ytdl from "ytdl-core";
import {
  runAsync,
  checkHealth,
  runSync,
  checkStatus,
} from "@/utils/gpuHandler";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { Session } from "next-auth";
import {
  deleteAudioFile,
  minutesToHHMMSS,
  ytAudioLink,
  getYouTubeVideoId,
  getYTLength,
  executeFFmpegCommand,
  findEmail,
} from "@/utils/voiceChangerUtils";

interface Body {
  endTime: { minutes: string | number };
  startTime: { minutes: string | number };
  voice: string;
  url: string;
  totalMin:string|number
}

interface UserToken {
  email: string;
  token: number;
  name: string;
  lastUsed: string;
}

interface Status {
  id: string;
  output: null | any;
  status: string;
  error: "";
}

const MAX_VIDEO_LIMIT = 3;
const parentDirectory = path.join(__dirname, "..", "..", "..", "..", "..");
async function processingSong(body: Body, session: Session, user: UserToken) {
  if (session && session.user && session.user.email) {
    if (
      !Number(body.endTime.minutes) ||
      (Number(body.startTime.minutes) !== 0 && !Number(body.startTime.minutes))
    ) {
      return NextResponse.json(
        {
          err: `Not selected proper start and end time`,
        },
        { status: 500 }
      );
    }
    const isTooLarge =
      Number(body.endTime.minutes) - Number(body.startTime.minutes) <=
      Number(MAX_VIDEO_LIMIT);
    const isTooShort = Number(body.endTime.minutes) - Number(body.startTime.minutes) >0
    const isEndCoreect =  Number(body.totalMin) >= Number(body.endTime.minutes) 
    const isStartCorrect =   0 <= Number(body.startTime.minutes) 
    if (!isTooLarge ) {
      return NextResponse.json(
        {
          err: `Selected time is larger then ${MAX_VIDEO_LIMIT} minutes`,
        },
        { status: 500 }
      );
    }
    if (!isTooShort) {
      return NextResponse.json(
        {
          err: `Selected time is less then 1 minute`,
        },
        { status: 500 }
      );
    }
    if (!isEndCoreect) {
      return NextResponse.json(
        {
          err: `Select proper end time`,
        },
        { status: 500 }
      );
    }
    if (!isStartCorrect) {
      return NextResponse.json(
        {
          err: `Select proper start time`,
        },
        { status: 500 }
      );
    }
    if (!body.voice) {
      return NextResponse.json(
        {
          err: `Selected a voice`,
        },
        { status: 500 }
      );
    }
    const anyProcessRunning = await ActiveJobs.find({});
    console.log("any process:----", anyProcessRunning);
    if (findEmail(anyProcessRunning, session.user.email)) {
      return NextResponse.json(
        {
          err: "You can request one song at a time.",
        },
        { status: 500 }
      );
    }
    if (anyProcessRunning.length > 0) {
      return NextResponse.json(
        {
          err: "Server busy, try again in sometime",
        },
        { status: 500 }
      );
    }
    let isGPUavailable = await checkHealth();
    if (!isGPUavailable) {
      return NextResponse.json(
        {
          err: "Too much traffic, try again in sometime",
        },
        { status: 500 }
      );
    }

    let s3Upload = await trimAndS3(
      body.url,
      "ai-music-demo",
      body.startTime,
      body.endTime
    );
    s3Upload.trimmedFilePath && deleteAudioFile(s3Upload.trimmedFilePath);
    s3Upload.tempFilePath && deleteAudioFile(s3Upload.tempFilePath);

    if (!s3Upload.s3Url) {
      return NextResponse.json(
        {
          err: "Audio Issue, try again in sometime",
        },
        { status: 500 }
      );
    }
     isGPUavailable = await checkHealth();
    if (!isGPUavailable) {
      return NextResponse.json(
        {
          err: "Too much traffic, try again in sometime",
        },
        { status: 500 }
      );
    }
    const res = await runAsync(s3Upload.s3Url, body.voice);

    await ActiveJobs.create({
      name: session.user.name,
      image: session.user.image,
      jobID: res.id,
      email: session.user.email,
      currentStatus: res.status,
      voice: body.voice,
      ytUrl: body.url,
      videoTitle: s3Upload.videoDetails.title,
      ytThumb: s3Upload.videoDetails.thumbnails[0].url,
    });

    let status: Status = { id: "", status: "", output: {}, error: "" };
    let finalRet = null;
    await new Promise((resolve) => {
      let counter = 0;
      const i = setInterval(async () => {
        counter++;
        status = await checkStatus(res.id);
        if (
          ["COMPLETED", "FAILED"].includes(status.status) ||
          counter === 9 ||
          !["",undefined].includes(status.error)
        ) {
          console.log("status:    ----------   ", status,counter);
          clearInterval(i);
          resolve("Done");
        }
      }, 10000);
    });
    // console.log("status:    ----------   ", status);
    if (
      status &&
      status["status"] === "COMPLETED" &&
      status["output"] &&
      status["output"]["url"]
    ) {
      finalRet = status["output"]["url"]
        .split("[+] Cover generated at {'url': '")[1]
        .split("'}\n")[0];
      finalRet = finalRet.split(".mp3")[0] + ".mp3";
      finalRet = finalRet
        .replace(/%20/g, "+")
        .replace("%28", "(")
        .replace("%29", ")");
      await TodaySongs.create({
        name: session.user.name,
        email: session.user.email,
        voice: body.voice,
        ytUrl: body.url,
        image: session.user.image,
        videoTitle: s3Upload.videoDetails.title,
        s3Link: finalRet,
        ytThumb: s3Upload.videoDetails.thumbnails[0].url,
      });
      await handleToken(user.email, Number(process.env.DAILY_TOKEN) - 1);
    }
    await ActiveJobs.deleteOne({ jobID: res.id, email: session.user.email });

    if (finalRet !== null) {
      return NextResponse.json(
        {
          url: finalRet,
          token: Number(process.env.DAILY_TOKEN) - 1,
          msz: "Thanks for your patience",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          err: "Try again in sometime",
          token: user.token,
        },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      {
        err: "Please Login",
      },
      { status: 500 }
    );
  }
}
function startS3() {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_BUCKET_SECRET_ACCESS_KEY,
    region: process.env.AWS_BUCKET_AREA,
  });

  return s3;
}

async function uploadFile(path: string) {
  const s3 = startS3();
  const stream = fs.createReadStream(path);

  const uploadParams: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME || "ai-music-demo",
    Key: path.slice(2),
    Body: stream,
  };

  try {
    const data = await s3.upload(uploadParams).promise();
    console.log("File uploaded successfully:", data);

    const presignedUrlParams = {
      Bucket: process.env.AWS_BUCKET_NAME || "ai-music-demo",
      Key: path.slice(2),
    };

    const presignedUrl = await s3.getSignedUrlPromise(
      "getObject",
      presignedUrlParams
    );
    console.log("Presigned URL:", presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

async function trimAndS3(
  url: string,
  s3Bucket: string,
  sT: { minutes: string | number },
  eT: { minutes: string | number }
) {
  const randomNum = Math.ceil(Math.random() * 10000000);
  const tempFilePath = `./Trimmed_Audio/${randomNum}_temp_audio.mp3`;
  const trimmedFilePath = `./Trimmed_Audio/${randomNum}_trimmed_audio.mp3`;
  try {
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    let audio128 = {};
    // console.log('audioformats',audioFormats)
    audioFormats.forEach((val, i) => {
      if (val["audioBitrate"] === 128) {
        audio128 = val;
      }
    });
    //@ts-ignore
    if (!audio128["audioBitrate"]) {
      return { s3Url: null, trimmedFilePath, tempFilePath };
    }

    const audioStream = ytdl.downloadFromInfo(info, {
      //@ts-ignore
      format: audio128,
    });

    const writer = fs.createWriteStream(tempFilePath);
    audioStream.pipe(writer);

    new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    const startTime = Number(sT.minutes) * 60;
    const endTime = Number(eT.minutes) * 60;
    const duration = Number(eT.minutes) * 60 - Number(sT.minutes) * 60;
    console.log("duration:", duration);
    // Trim the audio

    await executeFFmpegCommand(
      tempFilePath,
      trimmedFilePath,
      startTime,
      endTime,
      duration,
      randomNum
    );
    const s3Url = await uploadFile(trimmedFilePath);

    return { s3Url:s3Url, trimmedFilePath, tempFilePath, videoDetails };
  } catch (error) {
    console.error("Error downloading, trimming, or uploading audio:", error);
    return { s3Url: null, trimmedFilePath, tempFilePath };
  }
}

async function handleToken(email: string, token: number) {
  const updatedUser = await UserToken.findOneAndUpdate({ email }, { token });
  return updatedUser;
}

export async function POST(req: Request, res: Response) {
  const session = await getServerSession(options);
  if (session && session.user && session.user.email) {
    const { success } = await rateLimiter.limit(session.user.email);
    if (!success) {
      return NextResponse.json({ err: "TOO_MANY_REQUESTS" }, { status: 500 });
    }

    try {
      await connectMongoDB();
      // await req.json()
      let passedValue = await new Response(req.body).text();
      let body = JSON.parse(passedValue);
      const user = await UserToken.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          {
            err: "User not found",
          },
          { status: 500 }
        );
      }
      const { token } = user;
      const isOneDayOld =
        Number(process.env.ONE_DAY_SECONDS) <
        (new Date().getTime() - new Date(user.lastUsed).getTime()) / 1000;
      if (isOneDayOld) {
        return await processingSong(body, session, user);
      } else {
        if (token <= 0) {
          return NextResponse.json(
            {
              err: "You are out of tokens",
            },
            { status: 500 }
          );
        } else if (token) {
          return await processingSong(body, session, user);
        }
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { err: "Something went wrong" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ err: "Please login" }, { status: 500 });
  }
}
