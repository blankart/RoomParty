import { APP_NAME } from "@rooms2watch/shared-lib";
import { InferSubscriptionOutput } from "@web/types/trpc";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import _intersectionBy from 'lodash.intersectionby'
import { User } from ".prisma/client";

export type ConnectionMetadata = {
    roomTransientId: string,
    picture?: string
    name: string,
    isMuted: boolean
    isVideoDisabled: boolean
}

type PeerMediaConnection = MediaConnection & { metadata: ConnectionMetadata }

type VideoChatSubscriptionResult = ReturnType<
    InferSubscriptionOutput<"video-chat.videoChatSubscription">["output"]
>

class VideoCallPeer {
    peer: Peer
    myMediaStream: MediaStream
    isMuted: boolean
    isVideoDisabled: boolean
    roomTransientId: string
    user: { user: User, id: string } | null | undefined
    userName: string

    peersMediaConnections: PeerMediaConnection[] = []
    remoteStreams: { stream: MediaStream, metadata: ConnectionMetadata }[] = []
    cb2: (args: VideoCallPeer) => any

    get myMetadata() {
        const myMetadata: ConnectionMetadata = {
            isMuted: this.isMuted,
            isVideoDisabled: this.isVideoDisabled,
            name: this.user?.user?.name ?? this.userName,
            picture: this.user?.user?.picture ?? undefined,
            roomTransientId: this.roomTransientId
        }

        return myMetadata
    }

    private generatePeerConnectionId(roomTransientId: string) {
        return `${APP_NAME}-room-${roomTransientId}`;
    }

    private createEmptyAudioTrack() {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        const track = (dst as any).stream.getAudioTracks()[0];
        return Object.assign(track, { enabled: false });
    };

    private createEmptyVideoTrack({ width, height }: { width: number, height: number }) {
        const canvas = Object.assign(document.createElement('canvas'), { width, height });

        canvas.getContext('2d')?.fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        const track = stream.getVideoTracks()[0];

        return Object.assign(track, { enabled: false });
    };


    getVideoChatSubscriptionChanges(
        oldData: VideoChatSubscriptionResult,
        newData: VideoChatSubscriptionResult
    ) {
        return {
            entered: newData.filter(
                (nd) =>
                    nd.roomTransientId !== this.roomTransientId &&
                    !oldData.some((od) => od.roomTransientId === nd.roomTransientId)
            ),
            left: oldData.filter(
                (nd) =>
                    nd.roomTransientId !== this.roomTransientId &&
                    !newData.some((od) => od.roomTransientId === nd.roomTransientId)
            ),

            stateChanged: _intersectionBy(
                [...newData, ...oldData],
                (nd) => nd.roomTransientId
            ).filter((nd) => {
                const old = oldData.find(
                    (od) => od.roomTransientId === nd.roomTransientId
                );

                return (
                    old &&
                    (old.isMuted !== nd.isMuted ||
                        old.isVideoDisabled !== nd.isVideoDisabled)
                );
            }),
        };
    }

    async handleWhenSomeoneEntered(data: VideoChatSubscriptionResult) {
        data.forEach(vcs => {
            const myMediaStream = this.myMediaStream ?? new MediaStream([
                this.createEmptyAudioTrack(),
                this.createEmptyVideoTrack({ width: 300, height: 300 })
            ])

            console.log('MY METADATA: ', this.myMetadata, vcs)
            const mediaConnection = this.peer.call(
                this.generatePeerConnectionId(vcs.roomTransientId),
                myMediaStream,
                {
                    metadata: this.myMetadata
                })

            mediaConnection.on('stream', remoteStream => {
                if (this.remoteStreams.find(rs => rs.stream.id === remoteStream.id)) return
                this.remoteStreams.push({
                    stream: remoteStream,
                    metadata: {
                        isMuted: vcs.isMuted,
                        isVideoDisabled: vcs.isVideoDisabled,
                        name: vcs.name,
                        roomTransientId: vcs.roomTransientId,
                        picture: vcs.picture
                    }
                })
                this.peersMediaConnections.push(mediaConnection)
                console.log('streaming...s')
                this.cb2(this)
            })
        })
    }


    async handleWhenSomeoneLeft(data: VideoChatSubscriptionResult) {

    }

    async handleWhenSomeoneStateChanged(data: VideoChatSubscriptionResult) {
        this.remoteStreams.forEach(rs => {
            const maybeChangedState = data.find(s => s.roomTransientId === rs.metadata.roomTransientId)

            if (maybeChangedState) {
                console.log(rs.metadata, maybeChangedState)
                Object.assign(rs.metadata, maybeChangedState)
            }
        })

        this.cb2(this)
    }

    async toggleVideo() {
        const newVideoDisabledState = !this.isVideoDisabled
        if (newVideoDisabledState) {
            this.myMediaStream?.getVideoTracks().forEach(t => {
                t.enabled = false
                setTimeout(() => {
                    t.stop()
                }, 100)
            })
        } else {
            this.myMediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: !this.isMuted
            })

            const [videoTrack] = this.myMediaStream.getVideoTracks()
            this.peersMediaConnections.forEach(pmc => {
                const sender = pmc.peerConnection.getSenders().find(s => s.track?.kind === videoTrack.kind)

                sender?.replaceTrack(videoTrack)
            })

        }

        this.isVideoDisabled = newVideoDisabledState
        window.localStorage.setItem(`${APP_NAME}-video-call-is-video-disabled`, JSON.stringify(newVideoDisabledState))

        this.cb2(this)
    }

    async toggleAudio() {
    }

    constructor(
        data: {
            roomTransientId: string,
            user: { user: User, id: string } | null | undefined
            userName: string
        },
        cb: (args: VideoCallPeer) => any,
        cb2: (args: VideoCallPeer) => any
    ) {
        this.roomTransientId = data.roomTransientId
        this.user = data.user
        this.userName = data.userName
        this.cb2 = cb2

        this.peer = new Peer(this.generatePeerConnectionId(this.roomTransientId), {
            debug: process.env.NODE_ENV === 'development' ? 3 : 0
        })


        this.isMuted = JSON.parse(window.localStorage.getItem(`${APP_NAME}-video-call-is-muted`) || 'true')
        this.isVideoDisabled = JSON.parse(window.localStorage.getItem(`${APP_NAME}-video-call-is-video-disabled`) || 'true')

        const getUserMediaOptions = {
            audio: !this.isMuted,
            video: !this.isVideoDisabled
        }

        this.myMediaStream = new MediaStream([
            this.createEmptyAudioTrack(),
            this.createEmptyVideoTrack({ width: 300, height: 300 })
        ])
        this.cb2(this)

        if (!this.isMuted || !this.isVideoDisabled) {
            navigator.mediaDevices.getUserMedia(getUserMediaOptions).then(s => {
                this.myMediaStream = s
                this.cb2(this)
            })
        }

        this.peer.on('open', () => {
            cb(this)
            this.peer.on('call', this.handleSomeoneCalled.bind(this))
        })
    }

    private handleSomeoneCalled(mediaConnection: PeerMediaConnection) {
        console.log('someone called!', mediaConnection.metadata)
        mediaConnection.answer(this.myMediaStream ??
            new MediaStream([
                this.createEmptyAudioTrack(),
                this.createEmptyVideoTrack({ width: 300, height: 300 })
            ])
        )

        mediaConnection.on('stream', remoteStream => {
            if (this.remoteStreams.find(rs => rs.stream.id === remoteStream.id)) return
            this.remoteStreams.push({ stream: remoteStream, metadata: mediaConnection.metadata })
            this.peersMediaConnections.push(mediaConnection)
            console.log('streaming... after someone called')
            this.cb2(this)
        })
    }
}

export default VideoCallPeer