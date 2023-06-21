'use client'
import { Button, ButtonSize } from '@/components/Button'
import React, { useRef , useState} from 'react'
import { openStream } from './helpers'
import { Input, InputSize } from '@/components/Input'
import { Select } from '@/components/Select'


enum CameraState {
  Closed,
  Opening,
  Opened,
}

const CameraPage = () => {
  const [error, setError] = useState("")
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.Closed)
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)


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
      if (error instanceof Error){
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

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between px-10 py-20" >
      <video 
        ref={videoRef}
        className="w-full max-w-2xl rounded" 
        autoPlay 
        muted 
        playsInline
        poster={cameraState === CameraState.Opened? "": posterUrl}
      ></video>

      <div className="absolute flex flex-col items-center bg-zinc-900/90 rounded-t-xl w-full bottom-0 py-2 px-5">
        {bottomPanelExpanded && (<>
          <h2 className="font-bold mb-4">Recording Options</h2>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Until</label>
            <Input type="datetime-local" inputSize={InputSize.Large} />
          </div>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Every</label>
            <span>
              <Input name="intervalValue" type="number" inputSize={InputSize.Small} className="mx-2" />
              <Select name="unit">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </Select>
            </span>
          </div>
          <div className="flex flex-row justify-between w-full py-2">
            <label>Record Until</label>
            <span>
              <Input name="lengthValue" type="number" inputSize={InputSize.Small} className="mx-2" />
              <Select name="unit">
                <option value="seconds">Seconds</option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </Select>
            </span>
          </div>
        </>)}

        { isCamOpen? (<>
          <div className="flex flex-row justify-around"> 
            <Button size={ButtonSize.Medium} confirm >
              Start
            </Button>
            <Button size={ButtonSize.Large} danger onClick={closeCamera} >
              Close Camera
            </Button>
            <Button size={ButtonSize.Small} onClick={() => setBottomPanelExpanded(exp => !exp)}>
              {bottomPanelExpanded? "-": "+"}
            </Button>
          </div>
        </>): (<Button size={ButtonSize.Large} onClick={openCamera} >
          Open Camera
        </Button>)}
        
      </div>
      
    </main>
  )
}

export default CameraPage
