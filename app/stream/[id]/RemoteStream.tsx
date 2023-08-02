'use client'
import { Button } from "@/components/Button"
import { SignalChannel, ViewerChannel } from "@/lib/SignalChannel";
import React, { useRef, useState } from "react"

enum RemoteStreamStatus {
  Default,
  Connecting,
  Connected,
}

export function RemoteStream({
  id
}: {
  id: string,
}) {
  const [status, setStatus] = useState<RemoteStreamStatus>(RemoteStreamStatus.Default);
  const localVideo = useRef<HTMLVideoElement>(null);
  const dummyCanvas = useRef<HTMLCanvasElement>(null);
  const [signalChannel, setSignalChannel] = useState<SignalChannel | null>(null);
  const isConnecting = status === RemoteStreamStatus.Connecting;
  const isConnected = status === RemoteStreamStatus.Connected;

  function connectStream() {
    console.log(111)
    const dummyStream = dummyCanvas.current!.captureStream(15);
    const channel = new ViewerChannel(id, localVideo.current!, dummyStream);
    channel.addEventListener('initialized', () => {
      channel.connect()
      setStatus(RemoteStreamStatus.Connecting);
      setSignalChannel(channel);
    })

    channel.addEventListener('track', (track) => {
      setStatus(RemoteStreamStatus.Connected);
      console.log('got track', track);
    })
  }

  return (<>
    <span>{status}</span>
    <canvas id="local-canvas" ref={dummyCanvas} width={1} height={1} hidden></canvas>
    <video
      id="remote-video"
      ref={localVideo}
      autoPlay
      playsInline
      poster="https://placekitten.com/400/300">
    </video>
    {!isConnected ? <Button
      onClick={() => connectStream()}
      {...(isConnecting ? { disabled: true } : {})}
    >
      Connect Stream
    </Button> : <Button> Disconnect </Button>}
  </>)
}
