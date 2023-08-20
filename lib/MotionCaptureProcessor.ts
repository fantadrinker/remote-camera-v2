export default class MotionCaptureProcessor {
  private _stream_in: MediaStream
  private _stream_out: MediaStream
  private _canvas: HTMLCanvasElement
  private _offscreen: OffscreenCanvas
  private _generator:  MediaStreamTrackGenerator 
  private _processor: MediaStreamTrackProcessor
  private _data: Array<Blob> = []

  private _transformer: TransformStream

  constructor(stream_in: MediaStream, vidw: number, vidh: number) {
    this._stream_in = stream_in
    this._stream_out = new MediaStream()

    const track = stream_in.getVideoTracks()[0]
    this._generator = new MediaStreamTrackGenerator({ kind: "video" });
    this._processor = new MediaStreamTrackProcessor({ track })

    // TODO: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas#asynchronous_display_of_frames_produced_by_an_offscreencanvas
    this._offscreen = new OffscreenCanvas(vidw, vidh)

    this._transformer = new TransformStream({
      transform: (videoFrame, controller) => {
        // draws the video frame as grayscale to off screen canvas
        videoFrame.width = videoFrame.displayWidth
        videoFrame.height = videoFrame.displayHeight
        // create new frame from canvas
        this.drawFrame(videoFrame)
        try {
          const newFrame = new VideoFrame(this._offscreen, { timestamp: videoFrame.timestamp })
          // send new frame to controller
          videoFrame.close()
          controller.enqueue(newFrame)
        } catch (error) {
          console.log(error)
          controller.enqueue(videoFrame)
        }
      }
    })
  }

  async drawFrame(videoFrame: VideoFrame) {
    const imgbmp = await createImageBitmap(videoFrame)
    const ctx = this._offscreen.getContext('2d')
    if (!ctx) throw new Error('could not get canvas context')
    ctx.save()
    ctx.drawImage(imgbmp, 0, 0, this._offscreen.width, this._offscreen.height)
    ctx.restore()
  }

  async extractFrame() {
    const imageData = await this._offscreen.convertToBlob({ type: 'image/png' })
    console.log(imageData)
  }

  viewData() {
    console.log(this._data.slice(-5))
  }

  start() {
    this._processor.readable
      .pipeThrough(this._transformer)
      .pipeTo(this._generator.writable)
    this._stream_out.addTrack(this._generator)
  }

  get stream() {
    return this._stream_out
  }
  stop() {
    this._stream_in.getTracks().forEach(track => track.stop())
    this._stream_out.getTracks().forEach(track => track.stop())
  }
}