import { Button } from "@/components/Button";
import React from "react";

interface StreamingControlsProps {
  closeCamera: () => void;
  startStreaming: () => void;
  stopStreaming: () => void;
  isStreaming: boolean;
}

export function StreamingControls({
  closeCamera,
  startStreaming,
  stopStreaming,
  isStreaming,
}: StreamingControlsProps) {
  function buttonClick() {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }
  return (<>
    <Button onClick={buttonClick}>
      {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
    </Button>
    {!isStreaming && <Button onClick={closeCamera}>Close Camera</Button>}
  </>);
}
