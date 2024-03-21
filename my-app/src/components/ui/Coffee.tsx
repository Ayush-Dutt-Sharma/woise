'use client'
import React from 'react';


function Coffee() {
  return (
    <>
    <a className='p-[10px]' target='_blank' href='https://www.buymeacoffee.com/duttsharma1'>
    <button className="bg-white  px-[10px] bg-opacity-50 md:w-[200px] sm:w-[150px]  no-underline cursor-pointer rounded-full text-xs font-semibold  text-black">
        <div className="relative flex space-x-2 items-center rounded-full bg-white bg-opacity-50 py-0.5 px-4 ring-1 ring-white/10 ">
        
      <img src={"https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"} alt="Buy me a coffee" />
          <span style={{ fontFamily: "var(--font-mono)"}}>{`Buy me a coffee`}</span>
        </div>
      </button>
      </a>
    </>
  );
}

export default Coffee;