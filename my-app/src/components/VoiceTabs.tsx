"use client";

import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";

export function VoiceTabs({ setVoice }: { setVoice: any }) {
  const tabs = [
    {
      title: "Narendra Modi",
      value: "Modi",
      content: (
        <div
          className="w-full overflow-hidden relative h-full rounded-2xl p-2 text-lg md:text-xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900"
        >
          <p>Narendra Modi</p>
          <SetImage path="/Modi.webp" title="Narendra Modi" />
        </div>
      ),
    },
    {
      title: "Elon Musk",
      value: "Elon",
      content: (
        <div 
        className="w-full overflow-hidden relative h-full rounded-2xl p-2 text-lg md:text-xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900"
        >
          <p>Elon Musk</p>
          <SetImage path={"/Elon.jpg"} title="Elon Musk" />
        </div>
      ),
    },
    {
      title: "Donald Trump",
      value: "Trump",
      content: (
        <div 
        className="w-full overflow-hidden relative h-full rounded-2xl p-2 text-lg md:text-xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900"
        >
          <p>Donald Trump</p>
          <SetImage path={"/Trump.webp"} title="Donald Trump" />
        </div>
      ),
    },
    {
      title: "Joe Biden",
      value: "Biden",
      content: (
        <div 
        className="w-full overflow-hidden relative h-full rounded-2xl p-2 text-lg md:text-xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900"
        >
          <p>Joe Biden</p>
          <SetImage path={"/Biden.webp"} title="Joe Biden" />
        </div>
      ),
    },
    {
      title: "Shah Rukh Khan",
      value: "SRK",
      content: (
        <div 
        className="w-full overflow-hidden relative h-full rounded-2xl p-2 text-lg md:text-xl font-bold text-white bg-gradient-to-br from-purple-700 to-violet-900"
        >
          <p>Shah Rukh Khan</p>
          <SetImage path={"/SRK.jpg"} title="Shah Rukh Khan" />
        </div>
      ),
    },
  ];

  return (
    <div className="h-[15rem] md:h-[20rem] relative flex flex-col mx-auto sm:w-[10rem] md:w-[20rem] my-[8rem]">
      <Tabs tabs={tabs} setVoice={setVoice} />
    </div>
  );
}

const SetImage = (props: { path: string; title: string }) => {
  const { path, title } = props;
  return (
    <Image
      src={path}
      alt={title}
      width="100"
      height="100"
      className="object-cover h-[80%]  md:h-[100%] absolute p-2 inset-x-0 w-[80%] rounded-xl mx-auto"
    />
  );
};
