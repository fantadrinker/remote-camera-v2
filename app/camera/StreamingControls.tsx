import React from "react";
import { Button } from "@/components/Button";
import { StreamingState } from "@/lib/SignalChannel";

interface StreamingControlsProps {
  closeCamera: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
  streamingState: StreamingState;
  streamID: string;
}

export function StreamingControls({
  closeCamera,
  startStreaming,
  stopStreaming,
  streamingState,
  streamID,
}: StreamingControlsProps) {

  const isStreaming = streamingState === StreamingState.Streaming;
  const isNotStreaming = streamingState === StreamingState.NotStreaming;
  const isConnecting = streamingState === StreamingState.Connecting;

  function toggleStream() {
    if (isStreaming) {
      stopStreaming();
    } else if (isNotStreaming) {
      startStreaming();
    }
  }

  return (<>
    {isStreaming && streamID && (<div>
      <span>Streaming...</span>
      <input disabled type="text" value={streamID} />
    </div>)}
    <Button disabled={isConnecting} onClick={toggleStream}>
      {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
    </Button>
    {!isStreaming && <Button onClick={closeCamera}>Close Camera</Button>}
  </>);
}
