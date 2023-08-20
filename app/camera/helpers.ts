const wait = (delayInMS: number) => {
  return new Promise(resolve => setTimeout(resolve, delayInMS))
}

export const openStream = async (
  vid: HTMLMediaElement,
) => {
  try {
    const future = new Promise((resolve, reject) => {
      vid.onloadedmetadata = () => {
        vid.play()
        resolve(vid.srcObject)
      }
      vid.onerror = (e) => {
        reject(e)
      }
    })

    const stream = await navigator.mediaDevices.getUserMedia({
      // need to work with this carefully, ios12 might not like it
      video: {
        width: 320,
        facingMode: 'user',
        frameRate: 15,
        // aspectRatio: {exact: 0.5}, // debugging mobile
      },
      audio: false,
    })

    vid.srcObject = stream
    return future
  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotFoundError':
          msg = 'camera not found'
          break
        case 'NotReadableError':
          msg = 'camera is already in use'
          break
        case 'NotAllowedError':
          msg = 'permission denied'
          break
        case 'AbortError':
          msg = 'permission denied'
          break
        case 'OverconstrainedError':
          msg = 'camera does not satisfy requirements'
          break
      }
    }
    console.log('error opening camera: ' + error)
    throw new Error(msg)
  }
}

export const openStreamNoVideoElement = async () => {
  try {

    return await navigator.mediaDevices.getUserMedia({
      // need to work with this carefully, ios12 might not like it
      video: {
        width: 320,
        facingMode: 'user',
        frameRate: 15,
        // aspectRatio: {exact: 0.5}, // debugging mobile
      },
      audio: false,
    })

  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotFoundError':
          msg = 'camera not found'
          break
        case 'NotReadableError':
          msg = 'camera is already in use'
          break
        case 'NotAllowedError':
          msg = 'permission denied'
          break
        case 'AbortError':
          msg = 'permission denied'
          break
        case 'OverconstrainedError':
          msg = 'camera does not satisfy requirements'
          break
      }
    }
    console.log('error opening camera: ' + error)
    throw new Error(msg)
  }
}

export const recordStream = (
  stream: MediaStream,
  lengthInMS: number,
  log: (msg: string) => void = console.log
) => {
  let recorder = new MediaRecorder(stream)
  let data: Array<Blob> = []

  recorder.ondataavailable = event => data.push(event.data)
  recorder.start()
  log(`${recorder.state} for ${lengthInMS / 1000} seconds…`)

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve
    recorder.onerror = event => reject(event)
  })

  let recorded = wait(lengthInMS).then(() => {
    if (recorder.state === 'recording') {
      recorder.stop()
    }
  })

  return Promise.all([stopped, recorded]).then(() => 
    new Blob(data, {
      type: 'video/webm'
    })
  )
}
