import fs from "fs";
import ytdl from "ytdl-core";
import path from 'path'
const {spawn,exec} = require('child_process');
//@ts-ignore
import ffmpeg from "fluent-ffmpeg";

interface RetObject {
  "128": { [key: string]: any };
  other: any[any];
}

export function findEmail(data:any[],email:string){
let ret =false
for(let i=0;i<data.length;i++){
if(data[i].email===email){ret=true}
}
return ret
}

export function deleteAudioFile(filePath: string) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error: any) => {
      if (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        reject(error);
      } else {
        console.log(`File ${filePath} deleted successfully`);
        resolve("Done");
      }
    });
  });
}

export function minutesToHHMMSS(minutes: number) {
  if (typeof minutes !== "number" || minutes < 0) {
    throw new Error("Input must be a positive number");
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(remainingMinutes).padStart(2, "0");
  const secondsStr = "00"; // Since we're converting to HH:MM:SS, seconds will always be '00'

  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

export async function ytAudioLink(url: string) {
  try {
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");

    if (audioFormats.length === 0) {
      return null;
    }
    let ret: RetObject = { "128": {}, other: [] };
    const audioLinks = audioFormats.forEach((format) => {
      const temp = {
        url: format.url,
        quality: format.audioQuality,
        bitrate: format.audioBitrate,
        mimeType: format.mimeType,
      };
      if (format.audioBitrate === 128) {
        ret["128"] = temp;
      } else {
        ret["other"].push(temp);
      }
    });

    return ret;
  } catch (error) {
    console.error("Error getting audio links:", error);
    return null;
  }
}
export function convertDurationToSeconds(duration: string) {
  // Extract hours, minutes, and seconds from the duration string
  const hoursMatch = duration.match(/(\d+)H/);
  const minutesMatch = duration.match(/(\d+)M/);
  const secondsMatch = duration.match(/(\d+)S/);

  // Initialize variables to hold hours, minutes, and seconds
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  // Convert hours if present
  if (hoursMatch) {
    hours = parseInt(hoursMatch[1]);
  }

  // Convert minutes if present
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1]);
  }

  // Convert seconds if present
  if (secondsMatch) {
    seconds = parseInt(secondsMatch[1]);
  }

  // Calculate total seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  return totalSeconds;
}

export function getYouTubeVideoId(url: string) {
  try {
    console.log("start-------", url);
    var videoURL = url;
    if (videoURL.includes("v=")) {
      let splited = videoURL.split("v=");
      console.log("splites", splited);
      if (!(splited[1].length < 12)) {
        var match = splited[1].split("&");
        if (match) {
          var videoId = match[0];
          console.log("Video ID:", videoId);
          return videoId;
        } else {
          console.error("Invalid YouTube URL:", url);
          return null;
        }
      } else {
        return splited[1];
      }
    } else if (videoURL.includes("youtu.be/")) {
      let splited = videoURL.split("https://youtu.be/");
      if (!(splited[1].length < 12)) {
        var match = splited[1].split("?");
        if (match) {
          var videoId = match[0];
          console.log("Video ID:", videoId);
          return videoId;
        } else {
          console.error("Invalid YouTube URL:", url);
          return null;
        }
      } else {
        return splited[1];
      }
    }
    return null;
  } catch (err) {
    console.log("err", err);
    return null;
  }
}

export async function getYTLength(videoId: string) {
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${process.env.YOUTUBE_API_KEY}&part=contentDetails`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (
      data &&
      data.items &&
      data.items[0] &&
      data.items[0] &&
      data.items[0].contentDetails &&
      data.items[0].contentDetails.duration
    ) {
      const duration = data.items[0].contentDetails.duration;
      const totalSeconds = convertDurationToSeconds(duration);
      console.log("Video duration:", duration, totalSeconds);
      return totalSeconds;
    } else {
      console.log("Youtube API didn't worked");
      return null;
    }
  } catch (error) {
    console.error("Error fetching video data:", error);
    return null;
  }
}

export async function executeFFmpegCommand(
  inputFilePath: string,
  outputFilePath: string,
  startTime: number,
  endTime: number,
  duration: number,
  randomNum:number
) {
  console.log("dirname: ",startTime,endTime,randomNum);
  const parentDirectory = path.join(__dirname, '..','..','..','..','..');
  console.log(parentDirectory)
  await new Promise((resolve,rej)=>{
    setTimeout(()=>{
      resolve('Done')
    },2000)
  })
  return await new Promise((resolve, reject) => {
    const ffmpegCmd = `ffmpeg -y -i "${parentDirectory}/${inputFilePath.slice(
      2
    )}" -vn -ss ${startTime} -to ${endTime} -c:a libmp3lame -q:a 0 "${parentDirectory}/${outputFilePath.slice(
      2
    )}"`;

    exec(ffmpegCmd, (error:any, stdout:any, stderr:any) => {
      if (error) {
        console.error("An error occurred:", error);
        resolve(error)
        return;
      }
      if (stderr) {
        console.error("ffmpeg stderr:", stderr);
        resolve(stderr);
        return;
      }
      console.log("Conversion complete");
      resolve("Done");
    });
  });
}
