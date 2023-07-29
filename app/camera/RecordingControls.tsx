
import { Button } from '@/components/Button'
import React, { useState } from 'react'
import { Input, InputSize } from '@/components/Input'
import { Select } from '@/components/Select'

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

interface RecordingControlsProps {
  startRecording: (
    untilMs: number,
    intervalMs: number,
    lengthMs: number,
  ) => void,
  stopRecording: () => void,
  takeScreenshot: () => void,
  closeCamera: () => void,
  isRecording: boolean,
}

export function RecordingControls({
  startRecording,
  stopRecording,
  takeScreenshot,
  closeCamera,
  isRecording
}: RecordingControlsProps) {
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
  return (<>
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
    <div className="flex flex-row justify-around">
      {!isRecording && (<Button confirm onClick={() => startRecording(
        recordUntil * UNIT_VALUES_TO_MS[recordUntilUnit],
        recordEvery * UNIT_VALUES_TO_MS[recordEveryUnit],
        recordLength * UNIT_VALUES_TO_MS[recordLengthUnit],
      )}>
        Start
      </Button>)}
      <Button onClick={() => takeScreenshot()}>Screenshot</Button>
      <Button danger onClick={isRecording ? stopRecording : closeCamera} >
        {isRecording ? 'Stop' : 'Close'}
      </Button>
    </div>
  </>)
}
