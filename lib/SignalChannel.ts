const SIGNAL_SERVER_URL = process.env.NEXT_PUBLIC_SIGNAL_SERVER_URL || 'ws://localhost:8080'

function defaultOnOpen() {
  console.log('connection opened')
}

interface EventData {
  message_type: string
  payload: any
}

const broadcastOfferOptions: RTCOfferOptions = {
  offerToReceiveAudio: false,
  offerToReceiveVideo: true,
}

const getRTCConfig = async () => {
  const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
  if (process.env.NODE_ENV === 'development') {
    return { iceServers }
  }
  try {
    const response = await fetch(
      `https://remotecamrtc.metered.live/api/v1/turn/credentials?apiKey=${process.env.ICE_SERVER_API_KEY
      }`
    )
    // Saving the response in the iceServers array
    const turnServers: RTCIceServer[] = await response.json()

    return {
      iceServers: [...iceServers, ...turnServers],
    }
  } catch (error) {
    console.log('failed fetching turn server info', error)
    return { iceServers }
  }
}

export class SignalChannel extends EventTarget {
  conn: WebSocket | null = null
  broadcastID: string
  isOpen: boolean = false
  onOpen: () => void = defaultOnOpen
  eventListeners: Record<string | number, (data: any) => void> = {}

  constructor(
    id: string,
    onOpen: () => void = defaultOnOpen
  ) {
    super()
    this.broadcastID = id
    this.onOpen = onOpen
  }

  connect(onClose: () => void) {
    this.conn = new WebSocket(
      SIGNAL_SERVER_URL,
    )
    this.conn.onmessage = msg => {
      if (msg.data === 'ping') {
        this.conn?.send('pong')
        return
      }

      const data: EventData = JSON.parse(msg.data)
      Object.keys(this.eventListeners).forEach(key => {
        const callback = this.eventListeners[key]
        if (data.message_type && key === data.message_type.toString()) {
          callback(data.payload)
        }
      })
    }
    this.conn.onopen = () => {
      this.isOpen = true
      this.onOpen()
    }
    this.conn.onclose = () => {
      onClose()
    }
  }

  on(event: string | number, callback: (data: any) => void) {
    this.eventListeners[event] = callback
  }

  emit(payload: any) {
    this.conn?.send(
      JSON.stringify({
        broadcastId: this.broadcastID,
        payload,
      })
    )
  }

  close() {
    this.conn?.close()
    this.isOpen = false
  }
}

export class BroadcastChannel extends SignalChannel {
  pcs: Record<string, RTCPeerConnection> = {}
  stream: MediaStream
  iceCandidatePool: Record<string, RTCIceCandidate[]> = {}
  constructor(id: string, stream: MediaStream) {
    super(id, () => {
      this.conn?.send(
        JSON.stringify({
          action: 'broadcastinit',
          data: {
            message_type: 'broadcast_init', // BROADCAST_OFFER
            broadcastId: id,
          }
        })
      )
    })
    this.stream = stream
    this.eventListeners = {
      // VIEWER_MESSAGE
      viewer_message: async (data: any) => {
        if (data.type === 'offer') {
          const { session_id, offer } = data
          const rtcConfig = await getRTCConfig()
          this.pcs[session_id] = new RTCPeerConnection(rtcConfig)
          stream.getTracks().forEach(track => {
            this.pcs[session_id].addTrack(track, stream)
          })
          this.pcs[session_id].addEventListener('icecandidate', event => {
            if (event.candidate) {
              this.conn?.send(
                JSON.stringify({
                  action: "broadcastsend",
                  data: {
                    message_type: 'broadcast_message', // BROADCAST_MESSAGE
                    viewerId: session_id,
                    data: {
                      type: 'icecandidate',
                      icecandidate: event.candidate,
                    },
                  }
                })
              )
            }
          })
          this.pcs[session_id].addEventListener(
            'connectionstatechange',
            event => {
              if (this.pcs[session_id].connectionState === 'connected') {
                console.log(
                  'connection state change',
                  event,
                  this.pcs[session_id].connectionState
                )
              }
            })
          this.pcs[session_id].setRemoteDescription(offer)
          this.pcs[session_id].createAnswer().then(answer => {
            this.pcs[session_id].setLocalDescription(answer).then(() => {
              while (this.iceCandidatePool[session_id]?.length > 0) {
                const icecandidate = this.iceCandidatePool[session_id].pop()
                if (icecandidate) {
                  this.pcs[session_id].addIceCandidate(icecandidate)
                }
              }
              this.conn?.send(
                JSON.stringify({
                  action: 'broadcastsend',
                  data: {
                    message_type: 'broadcast_message',
                    viewerId: session_id,
                    data: {
                      type: 'answer',
                      answer: answer,
                    },
                  }
                })
              )
            })
          })
        } else if (data.type === 'icecandidate') {
          const { session_id, icecandidate } = data
          if (!this.pcs[session_id]) {
            if (this.iceCandidatePool[session_id]) {
              this.iceCandidatePool[session_id].push(icecandidate)
            } else {
              this.iceCandidatePool[session_id] = [icecandidate]
            }
          } else {
            this.pcs[session_id].addIceCandidate(icecandidate)
          }
        }
      },
      error: (data: any) => {
        console.error(data)
      },
    }
  }

  connect() {
    super.connect(() => {
      Object.keys(this.pcs).forEach(key => {
        this.pcs[key].close()
      })
    })
  }

  emit(data: any) {
    this.conn?.send(
      JSON.stringify({
        broadcast_id: this.broadcastID,
        data: data,
      })
    )
  }
}

export class ViewerChannel extends SignalChannel {
  registered: boolean = false
  pc: RTCPeerConnection | null = null
  video: HTMLVideoElement
  iceCandidatePool: RTCIceCandidate[] = []
  constructor(
    id: string,
    video: HTMLVideoElement,
    localStream: MediaStream | null
  ) {
    // try to get stream, viewer should not provide video stream
    // but it apparently doesn't work on iphone
    super(id, () => {
      this.conn?.send(
        JSON.stringify({
          action: 'viewerinit',
          data: {
            message_type: 'viewer_join', // VIEWER_JOIN
            broadcastId: id,
          }
        })
      )
    })
    this.video = video
    this.pc = null
    getRTCConfig().then(rtcConfig => {
      this.pc = new RTCPeerConnection(rtcConfig)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          this.pc?.addTrack(track, localStream)
        })
      } else {
        console.warn(
          'starting viewer channel without local stream, this might cause connection issue on iphone'
        )
      }
      /* use trickle ice to send ice candidates as they are generated
                Once a RTCPeerConnection object is created, the underlying framework uses the provided ICE servers to gather candidates for connectivity establishment (ICE candidates). The event icegatheringstatechange on RTCPeerConnection signals in what state the ICE gathering is (new, gathering or complete).
                */
      this.pc.addEventListener('icecandidate', event => {
        if (event.candidate) {
          this.conn?.send(
            JSON.stringify({
              action: 'viewersend',
              data: {
                message_type: 'viewer_message', // VIEWER_MESSAGE
                data: {
                  type: 'icecandidate',
                  icecandidate: event.candidate,
                },
              }
            })
          )
        }
      })
      this.pc.addEventListener('track', async event => {
        console.log('track received', event, this.video)
        const [remoteStream] = event.streams
        this.video.srcObject = remoteStream
        this.dispatchEvent(new CustomEvent('track', { detail: remoteStream }))
      })
      this.pc.addEventListener('connectionstatechange', () => {
        if (this.pc?.connectionState === 'connected') {
          console.log('connected')
          this.conn?.send(JSON.stringify({
            action: 'viewersend',
            data: { message_type: 5 }
          })) // VIEWER_CONNECTED
        }
      })
      this.dispatchEvent(new CustomEvent('initialized'))
    })

    this.eventListeners = {
      session_created: (data: string) => {
        this.registered = true
        this.pc?.createOffer(broadcastOfferOptions).then(offer => {
          this.pc?.setLocalDescription(offer).then(() => {
            this.conn?.send(
              JSON.stringify({
                action: 'viewersend',
                data: {
                  message_type: 'viewer_message', // VIEWER_MESSAGE
                  data: {
                    session_id: data,
                    type: 'offer',
                    offer: offer,
                  },
                }
              })
            )
          })
        })
      },
      broadcast_message: (data: any) => {
        if (data.type === 'answer') {
          this.pc?.setRemoteDescription(data.answer).then(() => {
            while (this.iceCandidatePool.length > 0) {
              const icecandidate = this.iceCandidatePool.pop()
              if (icecandidate) {
                this.pc?.addIceCandidate(icecandidate)
              }
            }
          })
        } else if (data.type === 'icecandidate') {
          if (this.pc?.remoteDescription) {
            this.pc?.addIceCandidate(data.icecandidate).catch(err => {
              console.log('icecandidate error')
              console.error(err)
            })
          } else {
            this.iceCandidatePool.push(data.icecandidate)
          }
        }
      },
      error: (data: any) => {
        if (!this.registered) {
          console.error('error before session id is created')
          // should retry here

        }
        console.error(data)
      }
    }
  }

  connect() {
    super.connect(() => {
      this.pc?.close()
    })
  }

  close() {
    super.close()
    this.pc?.close()
  }
}

