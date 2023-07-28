'use client'
import { Button, ButtonSize } from '@/components/Button'
import React, { useRef, useState } from 'react'
import { openStream, recordStream } from './helpers'
import { Input, InputSize } from '@/components/Input'
import { Select } from '@/components/Select'
import { getUploadUrl } from './actions'
import { RecordingControls } from './RecordingControls'


enum CameraState {
  Closed,
  Opening,
  Opened,
}

enum TimeUnit {
  Seconds = 'seconds',
  Minutes = 'minutes',
  Hours = 'hours',
}

interface RecordingOptions {
  recordUntil: number
  recordUntilUnit: TimeUnit
  recordEvery: number
  recordEveryUnit: TimeUnit
  recordLength: number
  recordLengthUnit: TimeUnit
}

const UNIT_VALUES_TO_MS = Object.freeze({
  [TimeUnit.Seconds]: 1000,
  [TimeUnit.Minutes]: 1000 * 60,
  [TimeUnit.Hours]: 1000 * 60 * 60,
})


const CameraPage = () => {
  const [error, setError] = useState("")
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.Closed)
  const [recorderId, setRecorderId] = useState<number | null>(null)
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [{
    recordUntil,
    recordUntilUnit,
    recordEvery,
    recordEveryUnit,
    recordLength,
    recordLengthUnit,
  }, setRecordingOptions] = useState<RecordingOptions>({
    recordUntil: 0,
    recordUntilUnit: TimeUnit.Seconds,
    recordEvery: 0,
    recordEveryUnit: TimeUnit.Seconds,
    recordLength: 0,
    recordLengthUnit: TimeUnit.Seconds,
  })

  const showBroadcastingPanel = useState(false)


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

    // log some meta info

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
        {bottomPanelExpanded && (
          <RecordingControls
            startRecording={startRecording}
            stopRecording={stopRecording}
            takeScreenshot={takeScreenshot}
            closeCamera={closeCamera}
            isRecording={recorderId !== null}
          />
        )}
        {!isCamOpen && (<Button size={ButtonSize.Large} onClick={openCamera} >
          Open Camera
        </Button>)}

      </div>

    </main>
  )
}

export default CameraPage
