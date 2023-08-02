'use client'
import { Button, ButtonSize } from '@/components/Button'
import React, { useRef, useState } from 'react'
import { openStream, recordStream } from './helpers'
import { getUserName, getUploadUrl } from './actions'
import { RecordingControls } from './RecordingControls'
import { StreamingControls } from './StreamingControls'
import { BroadcastChannel, StreamingState } from '@/lib/SignalChannel'


enum CameraState {
  Closed,
  Opening,
  Opened,
}

const CameraPage = () => {
  const [error, setError] = useState("")
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.Closed)
  const [recorderId, setRecorderId] = useState<number | null>(null)
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(true)
  const [showRecordingMenu, setShowRecordingMenu] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signalChannel, setSignalChannel] = useState<BroadcastChannel | null>(null)
  const [streamingState, setStreamingState] = useState<StreamingState>(StreamingState.NotStreaming)

  const posterUrl = 'https://as1.ftcdn.net/v2/jpg/02/95/94/94/1000_F_295949484_8BrlWkTrPXTYzgMn3UebDl1O13PcVNMU.jpg'

  const isCamOpen = cameraState === CameraState.Opened
  const openCamera = async () => {
    if (cameraState !== CameraState.Closed || !videoRef.current) {
      return
    }

    setCameraState(CameraState.Opening)
    try {
      await openStream(videoRef.current)
      setCameraState(CameraState.Opened)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
      setCameraState(CameraState.Closed)
    }
  }

  const closeCamera = () => {
    if (cameraState !== CameraState.Opened || !videoRef.current) {
      return
    }

    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach(track => track.stop())
    videoRef.current.srcObject = null
    setCameraState(CameraState.Closed)
  }

  const recordAndUpload = async (stream: MediaStream, lengthMs: number) => {
    try {
      const vidBlob = await recordStream(stream, lengthMs)
      const uploadUrl = await getUploadUrl()
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: vidBlob,
        mode: 'cors',
      })
      return uploadResponse
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      }
    }
  }

  const startRecording = (
    untilMs: number,
    intervalMs: number,
    lengthMs: number
  ) => {
    if (cameraState !== CameraState.Opened || !videoRef.current || recorderId || !untilMs || !lengthMs) {
      console.log("camera not found")
      return
    }

    const stream = videoRef.current.srcObject as MediaStream
    recordAndUpload(stream, lengthMs)
    const intvId = window.setInterval(
      () => recordAndUpload(stream, lengthMs),
      intervalMs
    )

    setRecorderId(intvId)

    window.setTimeout(() => {
      window.clearInterval(intvId)
      setRecorderId(null)
      return;
    }, untilMs)

  }


  const stopRecording = () => {
    if (!recorderId) {
      return
    }
    window.clearInterval(recorderId)
    setRecorderId(null)
  }

  const takeScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
    const imgData = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'screenshot.png'
    link.href = imgData
    link.click()
  }

  function startStreaming(streamID: string) {
    if (!videoRef.current) {
      console.log("no video ref")
      return
    }
    let chan = signalChannel
    if (!chan) {
      chan = new BroadcastChannel(streamID, videoRef.current.srcObject as MediaStream)
      setSignalChannel(chan)
    }
    chan.addEventListener('connected', () => {
      if (chan) {
        setStreamingState(StreamingState.Streaming)
      } else {
        setStreamingState(StreamingState.NotStreaming)
      }
    })
    chan.connect()
    setStreamingState(StreamingState.Connecting)
  }

  function stopStreaming() {
    setStreamingState(StreamingState.NotStreaming)
    if (!signalChannel) {
      return
    }
    signalChannel.close()
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between px-10 py-20" >
      <video
        ref={videoRef}
        className="w-full max-w-2xl rounded"
        autoPlay
        muted
        playsInline
        poster={cameraState === CameraState.Opened ? "" : posterUrl}
      ></video>

      <canvas className="hidden" ref={canvasRef}></canvas>

      <div className="absolute flex flex-col items-center bg-zinc-900/90 rounded-t-xl w-full bottom-0 py-2 px-5">
        {bottomPanelExpanded && isCamOpen && (<>
          <div className="flex flex-row justify-between w-full py-2">
            <h2 className="font-bold mb-4">{showRecordingMenu ? "Recording Options" : "Streaming Options"}</h2>
            <label className="mb-2">recording Menu</label>
            <input type="checkbox" checked={showRecordingMenu} onChange={() => setShowRecordingMenu(!showRecordingMenu)} />
          </div>
          {showRecordingMenu ? <RecordingControls
            startRecording={startRecording}
            stopRecording={stopRecording}
            takeScreenshot={takeScreenshot}
            closeCamera={closeCamera}
            isRecording={recorderId !== null}
          /> : <StreamingControls
            closeCamera={closeCamera}
            startStreaming={startStreaming}
            stopStreaming={stopStreaming}
            streamingState={streamingState}
          />}
        </>
        )}
        {!isCamOpen && (<Button size={ButtonSize.Large} onClick={openCamera} >
          Open Camera
        </Button>)}

      </div>

    </main>
  )
}

export default CameraPage
