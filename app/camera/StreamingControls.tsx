import { Button } from "@/components/Button";
import React, { useState } from "react";

export function StreamingControls() {
  const [isStreaming, setIsStreaming] = useState(false);
  return (<>
    <Button onClick={() => setIsStreaming(v => !v)}>
      {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
    </Button>
  </>);
}
