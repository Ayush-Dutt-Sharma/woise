"use client";
import styles from "./page.module.css";
import { useState, useEffect, use } from "react";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { VoiceTabs } from "@/components/VoiceTabs";
import Modal from "@/components/ui/Modal";
import { Box } from "@mui/material";
import Coffee from "@/components/ui/Coffee";
import ClientOnly from "@/components/ClientOnly";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
// import { NextUIProvider } from "@nextui-org/react";

interface Time {
  minutes: number;
}
const initailModal = {
  showModal: false,
  isLoading: false,
  isError: "",
};
const MAX_VIDEO_TIME = 3;
function Home() {
  const [url, setURL] = useState("");
  const [startTime, setStartTime] = useState<Time>({ minutes: 0 });
  const [endTime, setEndTime] = useState<Time>({ minutes: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [totalMin, setTotalMin] = useState(0);
  const [voice, setVoice] = useState("Modi");
  const [modal, setModal] = useState(initailModal);

  const { showModal, isLoading, isError } = modal;
  const { push } = useRouter();
  useEffect(() => {
    setStartTime({ minutes: 0 });
    setTotalMin(0);
    setIsVisible(false);
  }, [url]);

  const startTimer = (time = 1000, cb: Function | undefined = undefined) => {
    setTimeout(() => {
      setModal((p) => {
        return { ...p, showModal: false, isError: "", isLoading: false };
      });
      if (cb !== undefined) {
        cb();
      }
    }, time);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    const { value } = event.target;
    const minutes = parseInt(value, 10);

    if (name === "startTime" && (Number(minutes) || minutes === 0)) {
      setStartTime({ minutes });
    } else if ((Number(minutes) || minutes === 0) && name === "endTime") {
      setEndTime({ minutes });
    }
  };

  const handleVideoDetails = async () => {
    setModal((p) => {
      return { ...p, isLoading: true, showModal: true };
    });
    try {
      let res = await fetch(`/api/videoDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add other headers if needed
        },
        body: JSON.stringify({
          url,
        }),
      });
      const data = await res.json();
      if (data && data.duration) {
        setIsVisible(true);
        setTotalMin(Math.ceil(data.duration / 60));
        if (Math.ceil(data.duration / 60) > Number(MAX_VIDEO_TIME)) {
          setEndTime({ minutes: Number(MAX_VIDEO_TIME) });
        } else {
          setEndTime({ minutes: Math.ceil(data.duration / 60) });
        }
        setModal((p) => {
          return { ...p, isLoading: false, isError: "Done" };
        });
        startTimer(2000);
      } else {
        setModal((p) => {
          return { ...p, isLoading: false, isError: data.err };
        });
        startTimer(2000);
      }
    } catch (err: any) {
      console.log(err);
      setModal((p) => {
        return { ...p, isLoading: false, isError: "Something went wrong" };
      });
      startTimer(2000);
    }
  };
  async function handleVoiceChanger() {
    setModal((p) => {
      return { ...p, isLoading: true, showModal: true };
    });
    try {
      let res = await fetch(`/api/voiceChanger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add other headers if needed
        },
        body: JSON.stringify({
          url,
          startTime,
          endTime,
          voice,
          totalMin,
        }),
      });
      const data = await res.json();
      if (data && data.msz) {
        setModal((p) => {
          return { ...p, isLoading: false, isError: data.msz };
        });
        startTimer(2000, () => {
          push("/Creative");
        });
      } else {
        setModal((p) => {
          return { ...p, isLoading: false, isError: data.err };
        });
        startTimer(2000);
      }
    } catch (err) {
      console.log(err);
      setModal((p) => {
        return { ...p, isLoading: false, isError: "Something went wrong" };
      });
      startTimer(2000);
    }
  }
  return (
    <>
      {/* <NextUIProvider> */}
      <ClientOnly>
        <Modal showModal={showModal} isLoading={isLoading} isError={isError} />
        <div style={{ fontFamily: "var(--font-mono)" }} className="m-20 text-[200px]">woise.co</div>
        <div className="h-screen w-screen bg-black  bg-grid-white/[0.2]  ">
          {/* <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_60%,black)]"></div> */}
          <div
            style={{ fontFamily: "var(--font-mono)" }}
            className="flex items-center justify-center flex-col m-10 text-white"
          >
            <p className="text-7xl m-5">create your AI Covers</p>
            <p className="text-xl text-[#ACE2E1]">
              convert any youtube video into your favorite artist voice
            </p>
          </div>
          <div className="bg-black bg-grid-white/[0.2] ">
            <div className="m-5 text-white  ">
              <h1
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: "bold",
                  fontSize: "50px",
                }}
                className=" "
              >
                Instructions
              </h1>
              <ul
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: "",
                  fontSize: "20px",
                  padding: "35px",
                  listStyleType: "square",
                }}
                className=""
              >
                <li>sign in (Note : 2 credits daily)</li>
                <li>Copy youtube video url</li>
                <li>click check url</li>
                <li>
                  Select Start and End time (Note: Max video time allowed is 3
                  minutes)
                </li>
                <li>Select the voice</li>
                <li>
                  Start the magic (Note : the process can take upto 5 mintutes)
                </li>
              </ul>
            </div>

            <div className="p-10">
              <BackgroundGradient className="rounded-[22px] max-h-24 p-4 sm:p-6 lg:p-8 bg-zinc-900">
                {" "}
                <input
                  className={styles.youtubeInput}
                  type="text"
                  placeholder="Youtube URL"
                  value={url}
                  onChange={(e) => {
                    setURL(e.target.value);
                  }}
                />
              </BackgroundGradient>
            </div>
          </div>
          <div className="flex justify-center items-center bg-black bg-grid-white/[0.2]">
            <button onClick={handleVideoDetails}>
              <div>
                <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                  check URL?
                </button>
              </div>
            </button>
          </div>
          {isVisible && totalMin && (
            <div
              style={{ fontFamily: "var(--font-mono)", padding: "1.5rem" }}
              className="text-white bg-black bg-grid-white/[0.2]"
            >
              <div className="flex justify-center items-center">
                <label>Audio start Time (minutes):</label>
                <input
                  className={styles["start-input"]}
                  type="text"
                  name="startTime"
                  value={startTime.minutes}
                  onChange={(e) => handleChange(e, "startTime")}
                />
              </div>

              <div
                className="flex justify-center items-center"
                style={{ margin: "5px" }}
              >
                <label>Audio end Time (minutes):</label>
                <input
                  className={styles["start-input"]}
                  style={{ marginLeft: "10px" }}
                  type="text"
                  name="endTime"
                  value={endTime.minutes}
                  onChange={(e) => handleChange(e, "endTime")}
                />
              </div>

              {/* <p>Selected Start Time: {startTime.minutes} minute</p>
          <p>Selected End Time: {endTime.minutes} minute</p> */}
              <div className="flex justify-center items-center">
                <p>Youtube video Total Time: {totalMin} minutes</p>
              </div>

              <div style={{ fontFamily: "var(--font-mono)" }}>
                <div>
                  <label
                    className="flex justify-center items-center text-2xl"
                    style={{ margin: "50px 0 -100px 0" }}
                  >
                    Select Voice
                  </label>
                  <div>
                    <VoiceTabs setVoice={setVoice} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className=" w-screen bg-black  bg-grid-white/[0.2] ">
            {/* Radial gradient for the container to give a faded look */}
            {/* <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div> */}

            {isVisible && totalMin && (
              <>
                <div className="border border-white/[1] flex flex-col max-w-sm mx-auto justify-center items-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 h-1/4 rounded-lg">
                  <button
                    className="relative flex flex-col max-w-sm mx-auto justify-center items-center w-full overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
                    onClick={handleVoiceChanger}
                  >
                    <span className="absolute inset-[10%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-3 py-1 text-4xl font-medium text-white backdrop-blur-3xl">
                      <span>{`Start the magic`}</span>
                    </span>
                  </button>
                </div>
              </>
            )}

            <Box
              sx={{
                display: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  xs: "flex",
                  md: "none",
                  padding: "20px",
                },
              }}
            >
              <Coffee />
            </Box>
          </div>
        </div>
      </ClientOnly>
      {/* </NextUIProvider> */}
    </>
  );
}

export default dynamic(() => Promise.resolve(Home), { ssr: false });
