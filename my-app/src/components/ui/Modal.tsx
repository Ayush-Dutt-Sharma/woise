import {useState} from 'react'
import '@/styles/loader.css'


export default function Modal({isLoading=false,isError='',showModal=false}){
    
    return (
        <>

        {showModal ? (
          <>
          <div className="modal-backdrop"></div>
            <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                  
                   {isLoading && <div style={{ fontFamily: "var(--font-mono)"}}  className='loader'></div>}
                   {isError!='' && <p style={{ fontFamily: "var(--font-mono)", padding: "1.5rem" }} className='text-lg text-black'>{isError}</p>}
   
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </>
    )
}