'use client'
import { Button, ButtonSize } from '@/components/Button'
import React, { useRef, useState } from 'react'
import { openStream, recordStream } from './helpers'
import { Input, InputSize } from '@/components/Input'
import { Select } from '@/components/Select'
import { getUploadUrl } from './actions'


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

  const recordAndUpload = async (stream: MediaStream) => {
    try {
      const lengthInMs = recordLength * UNIT_VALUES_TO_MS[recordLengthUnit]
      const vidBlob = await recordStream(stream, lengthInMs)
      const uploadUrl = await getUploadUrl()
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
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

  const startRecording = () => {
    if (cameraState !== CameraState.Opened || !videoRef.current || recorderId || !recordEvery || !recordLength) {
      console.log("camera not found")
      return
    }

    // log some meta info
    console.log(`recording every ${recordEvery} ${recordEveryUnit} for ${recordLength} ${recordLengthUnit}, for ${recordUntil * UNIT_VALUES_TO_MS[recordUntilUnit] / (recordEvery * UNIT_VALUES_TO_MS[recordEveryUnit])} times`)

    const stream = videoRef.current.srcObject as MediaStream
    recordAndUpload(stream)
    const intvId = window.setInterval(
      () => recordAndUpload(stream),
      recordEvery * UNIT_VALUES_TO_MS[recordEveryUnit]
    )

    setRecorderId(intvId)

    window.setTimeout(() => {
      window.clearInterval(intvId)
      setRecorderId(null)
      return;
    }, recordUntil * UNIT_VALUES_TO_MS[recordUntilUnit])

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
        {bottomPanelExpanded && (<>
          <h2 className="font-bold mb-4">Recording Options</h2>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Until</label>
            <span>
              <Input
                name="totalTimeValue"
                type="number"
                min={0}
                inputSize={InputSize.XSmall}
                className="mx-2"
                value={recordUntil}
                onChange={(event) => setRecordingOptions(opt => ({
                  ...opt,
                  recordUntil: event.target.valueAsNumber,
                }))}
              />

              <Select name="unit" onChange={event => setRecordingOptions(opt => ({
                ...opt,
                recordUntilUnit: event.target.value as TimeUnit,
              }))}>
                <option value={TimeUnit.Seconds}>Seconds</option>
                <option value={TimeUnit.Minutes}>Minutes</option>
                <option value={TimeUnit.Hours}>Hours</option>
              </Select>
            </span>
          </div>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Every</label>
            <span>
              <Input
                name="intervalValue"
                type="number"
                inputSize={InputSize.XSmall}
                className="mx-2"
                value={recordEvery}
                onChange={(event) => setRecordingOptions(opt => ({
                  ...opt,
                  recordEvery: event.target.valueAsNumber,
                }))}
              />

              <Select name="unit" onChange={event => setRecordingOptions(opt => ({
                ...opt,
                recordEveryUnit: event.target.value as TimeUnit,
              }))}>
                <option value={TimeUnit.Seconds}>Seconds</option>
                <option value={TimeUnit.Minutes}>Minutes</option>
                <option value={TimeUnit.Hours}>Hours</option>
              </Select>
            </span>
          </div>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Length</label>
            <span>
              <Input
                name="lengthValue"
                type="number"
                inputSize={InputSize.XSmall}
                className="mx-2"
                onChange={(event) => setRecordingOptions(opt => ({
                  ...opt,
                  recordLength: event.target.valueAsNumber,
                }))}
                value={recordLength}
              />
              <Select name="unit" onChange={event => setRecordingOptions(opt => ({
                ...opt,
                recordLengthUnit: event.target.value as TimeUnit,
              }))}>
                <option value={TimeUnit.Seconds}>Seconds</option>
                <option value={TimeUnit.Minutes}>Minutes</option>
                <option value={TimeUnit.Hours}>Hours</option>
              </Select>
            </span>
          </div>
        </>)}

        {isCamOpen ? (<>
          <div className="flex flex-row justify-around">
            {!recorderId && (<Button confirm onClick={() => startRecording()}>
              Start
            </Button>)}
            <Button onClick={() => takeScreenshot()}>Screenshot</Button>
            <Button danger onClick={recorderId ? stopRecording : closeCamera} >
              {recorderId ? 'Stop Recording' : 'Close Camera'}
            </Button>
            <Button size={ButtonSize.Small} onClick={() => setBottomPanelExpanded(exp => !exp)}>
              {bottomPanelExpanded ? "-" : "+"}
            </Button>
          </div>
        </>) : (<Button size={ButtonSize.Large} onClick={openCamera} >
          Open Camera
        </Button>)}

      </div>

    </main>
  )
}

export default CameraPage
