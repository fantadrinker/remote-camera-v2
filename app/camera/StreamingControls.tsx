
import React from "react";
import { Button } from "@/components/Button";
import { StreamingState } from "@/lib/SignalChannel";
import { Input } from "@/components/Input";

interface StreamingControlsProps {
  closeCamera: () => void;
  startStreaming: (streamID: string) => void;
  stopStreaming: () => void;
  streamingState: StreamingState;
}

export function StreamingControls({
  closeCamera,
  startStreaming,
  stopStreaming,
  streamingState,
}: StreamingControlsProps) {
  const [streamID, setStreamID] = React.useState("");
  const isStreaming = streamingState === StreamingState.Streaming;
  const isNotStreaming = streamingState === StreamingState.NotStreaming;
  const isConnecting = streamingState === StreamingState.Connecting;

  function toggleStream() {
    if (isStreaming) {
      stopStreaming();
    } else if (isNotStreaming) {
      startStreaming(streamID);
    }
  }

  return (<>
    {isStreaming && streamID && (<div>
      <span>Streaming...</span>
      <input disabled type="text" value={streamID} />
    </div>)}
    {isNotStreaming && <div>
      <label> Stream ID </label>
      <Input type="text" value={streamID} onChange={(e) => setStreamID(e.target.value)} />
    </div>}
    <Button disabled={isConnecting} onClick={toggleStream}>
      {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
    </Button>
    {!isStreaming && <Button onClick={closeCamera}>Close Camera</Button>}
  </>);
}
