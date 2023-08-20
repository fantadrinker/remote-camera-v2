'use client'
import { Button } from '@/components/Button'
import React, { useEffect, useRef, useState } from 'react'
import { openStreamNoVideoElement } from '../camera/helpers'
import MotionCaptureProcessor from '@/lib/MotionCaptureProcessor'

enum CameraState {
  Closed,
  Opening,
  Opened,
}

export default function MotionCameraPage() {
  const [error, setError] = useState("")
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.Closed)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mcProcessor = useRef<MotionCaptureProcessor | null>(null)

  useEffect(() => {
    if (cameraState !== CameraState.Opened || !streamRef.current || !videoRef.current) {
      return
    }
    mcProcessor.current = new MotionCaptureProcessor(streamRef.current, 640, 320)
    mcProcessor.current.start()
    videoRef.current.srcObject = mcProcessor.current?.stream
  }, [cameraState])

  const openCamera = async () => {
    if (cameraState !== CameraState.Closed || !videoRef.current) {
      return
    }

    setCameraState(CameraState.Opening)
    try {
      const stream = (await openStreamNoVideoElement()) as MediaStream
      streamRef.current = stream
      setCameraState(CameraState.Opened)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
      setCameraState(CameraState.Closed)
    }
  }

  function closeCamera() {
    if (!videoRef.current) {
      return
    }

    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.current.srcObject = null
    mcProcessor.current?.stop()
    setCameraState(CameraState.Closed)
  }
  function logData() {
    mcProcessor.current?.viewData()
  }

  const posterUrl = 'https://as1.ftcdn.net/v2/jpg/02/95/94/94/1000_F_295949484_8BrlWkTrPXTYzgMn3UebDl1O13PcVNMU.jpg'

  return (<main className="relative flex min-h-screen flex-col items-center justify-between px-10 py-20" >
    <video
      ref={videoRef}
      className="w-full max-w-2xl rounded"
      autoPlay
      muted
      playsInline
      poster={cameraState === CameraState.Opened ? "" : posterUrl}
    ></video>
    <div className="absolute flex flex-col items-center bg-zinc-900/90 rounded-t-xl w-full bottom-0 py-2 px-5">
      {cameraState === CameraState.Closed && (
        <Button onClick={openCamera}>Open Camera and start</Button>
      )}
      {cameraState === CameraState.Opened && (<>
        <Button onClick={closeCamera}>Stop</Button>
        <Button onClick={logData} > log data </Button>
        <Button onClick={() => mcProcessor.current?.extractFrame()}> screenshot </Button>
      </>)}
    </div>
  </main>)
}