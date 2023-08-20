import { Button, ButtonSize } from "@/components/Button";
import { useState } from "react";

const IS_DEBUG = true

const INTERVAL = 1000

interface MonitoringControlsProps {
  videoRef: HTMLVideoElement | null
}

interface ProcessingStat {
  timestampStart: number,
  timestampEnd: number,
}

export function MonitoringControls({
  videoRef,
}: MonitoringControlsProps) {
  const [intervalId, setIntervalId] = useState<number | null>(null)
  const [stats, setStats] = useState<Array<ProcessingStat>>([])
  function screenshot(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    const ts1 = Date.now()
    console.log('drawing screenshots', videoElement, canvasElement)
    const ctx = canvasElement.getContext('2d')
    // draw the video at that frame
    ctx?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)
    const ts2 = Date.now()
    if (IS_DEBUG) setStats([...stats, { timestampStart: ts1, timestampEnd: ts2 }])
  }

  function startMonitoring() {
    if (!videoRef || !videoRef.parentElement || !videoRef.srcObject) {
      return
    }

    const stream = videoRef.srcObject as MediaStream
    const track = stream.getVideoTracks()[0];
    
    console.log("start monitoring", videoRef)
    // step 1: create a canvas element, and draw the video frame on it periodically 
    const canvasEl = document.createElement("canvas")
    videoRef.parentElement.appendChild(canvasEl)
    setIntervalId(window.setInterval(() => screenshot(videoRef, canvasEl), INTERVAL))
  }
  function stopMonitoring() {
    if (!intervalId) {
      return
    }
    window.clearInterval(intervalId)
    setIntervalId(null)
  }

  return (
    <div className="flex flex-row justify-between w-full py-2">
      <h2 className="font-bold mb-4">Monitoring Options</h2>
      <label className="mb-2">monitoring Menu</label>
      {!intervalId? (<Button size={ButtonSize.Small} onClick={startMonitoring}>
        Start Monitoring
      </Button>): (<Button size={ButtonSize.Small} onClick={stopMonitoring}>
        Stop Monitoring
      </Button>)}
      {IS_DEBUG && (<>
        <Button size={ButtonSize.Small} onClick={() => setStats([])}>
          Clear Stats
        </Button>
        <Button size={ButtonSize.Small} onClick={() => console.log(stats)}>
          Log Stats
        </Button>
      </>)}
    </div>
  )
}