'use client'
import { Button, ButtonSize } from '@/components/Button'
import React, { useRef } from 'react'

const CameraPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterUrl = 'https://as1.ftcdn.net/v2/jpg/02/95/94/94/1000_F_295949484_8BrlWkTrPXTYzgMn3UebDl1O13PcVNMU.jpg'
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between px-10 py-20" >
      <video 
        ref={videoRef}
        className="w-full max-w-2xl rounded" 
        autoPlay 
        muted 
        playsInline
        poster={posterUrl}
      ></video>

      <div className="absolute flex flex-col items-center bg-zinc-900/90 rounded-t-xl w-full bottom-0 py-2">
        <Button size={ButtonSize.Large}> Open Camera </Button>
      </div>
      
    </main>
  )
}

export default CameraPage
