"use client";
import '@/styles/btn.css'
import Stack from "@mui/material/Stack";
import { signIn } from "next-auth/react";


export default function SignBTN() {
  const handleSignIn = () => {
    signIn();
  };


  return (
    <>
      <Stack spacing={2} direction="column-reverse">
      <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50" onClick={handleSignIn}>
        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
        <span className="sign-btn">{`sign in`}</span>
        </span>
      </button>
      </Stack>
    </>
  );
}
