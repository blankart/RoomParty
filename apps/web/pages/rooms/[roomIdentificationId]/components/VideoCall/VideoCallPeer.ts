import { APP_NAME } from "@RoomParty/shared-lib";
import { InferSubscriptionOutput } from "@web/types/trpc";
import Peer, { MediaConnection } from "peerjs";
import _intersectionBy from "lodash.intersectionby";
import { User } from ".prisma/client";

export type ConnectionMetadata = {
  roomTransientId: string;
  picture?: string;
  name: string;
  isMuted: boolean;
  isVideoDisabled: boolean;
};

type PeerMediaConnection = MediaConnection & { metadata: ConnectionMetadata };

type VideoChatSubscriptionResult = ReturnType<
  InferSubscriptionOutput<"video-chat.videoChatSubscription">["output"]
>;

class VideoCallPeer {
  peer: Peer;
  myMediaStream: MediaStream;
  isMuted: boolean;
  isVideoDisabled: boolean;
  roomTransientId: string;
  user: { user: User; id: string } | null | undefined;
  userName: string;

  peersMediaConnections: PeerMediaConnection[] = [];
  remoteStreams: { stream: MediaStream; metadata: ConnectionMetadata }[] = [];
  rerender: (args: VideoCallPeer) => any;

  private readonly LOCAL_STORAGE_VIDEO_CALL_MUTED_KEY = `${APP_NAME}-video-call-is-muted`;
  private readonly LOCAL_STORAGE_VIDEO_CALL_VIDEO_DISABLED_KEY = `${APP_NAME}-video-call-is-video-disabled`;

  constructor(
    data: {
      roomTransientId: string;
      user: { user: User; id: string } | null | undefined;
      userName: string;
    },
    cb: (args: VideoCallPeer) => any,
    rerender: (args: VideoCallPeer) => any
  ) {
    this.roomTransientId = data.roomTransientId;
    this.user = data.user;
    this.userName = data.userName;
    this.rerender = rerender;

    this.peer = new Peer(this.generatePeerConnectionId(this.roomTransientId), {
      debug: process.env.NODE_ENV === "development" ? 3 : 0,
    });

    this.isMuted = JSON.parse(
      window.localStorage.getItem(this.LOCAL_STORAGE_VIDEO_CALL_MUTED_KEY) ||
        "true"
    );
    this.isVideoDisabled = JSON.parse(
      window.localStorage.getItem(
        this.LOCAL_STORAGE_VIDEO_CALL_VIDEO_DISABLED_KEY
      ) || "true"
    );

    const getUserMediaOptions = {
      audio: !this.isMuted,
      video: !this.isVideoDisabled,
    };

    this.myMediaStream = new MediaStream([
      this.createEmptyAudioTrack(),
      this.createEmptyVideoTrack({ width: 300, height: 300 }),
    ]);
    this.rerender(this);

    if (!this.isMuted || !this.isVideoDisabled) {
      navigator.mediaDevices
        .getUserMedia(getUserMediaOptions)
        .then((s) => {
          this.myMediaStream = s;

          const [audioTrack] = this.myMediaStream.getAudioTracks();
          const [videoTrack] = this.myMediaStream.getVideoTracks();

          this.peersMediaConnections.forEach((pmc) => {
            const audioSender = pmc.peerConnection
              .getSenders()
              .find((s) => s.track?.kind === audioTrack?.kind);
            const videoSender = pmc.peerConnection
              .getSenders()
              .find((s) => s.track?.kind === videoTrack?.kind);

            audioSender?.replaceTrack(audioTrack);
            videoSender?.replaceTrack(videoTrack);
          });

          this.rerender(this);
        })
        .catch(() => {});
    }

    this.peer.on("open", () => {
      cb(this);
      this.peer.on("call", this.handleSomeoneCalled.bind(this));
    });
  }

  get myMetadata() {
    return {
      isMuted: this.isMuted,
      isVideoDisabled: this.isVideoDisabled,
      name: this.user?.user?.name ?? this.userName,
      picture: this.user?.user?.picture ?? undefined,
      roomTransientId: this.roomTransientId,
    } as ConnectionMetadata;
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
  }

  private createEmptyVideoTrack({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) {
    const canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d")?.fillRect(0, 0, width, height);

    const stream = canvas.captureStream();
    const track = stream.getVideoTracks()[0];

    return Object.assign(track, { enabled: false });
  }

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
    data.forEach((vcs) => {
      const myMediaStream =
        this.myMediaStream ??
        new MediaStream([
          this.createEmptyAudioTrack(),
          this.createEmptyVideoTrack({ width: 300, height: 300 }),
        ]);

      const mediaConnection = this.peer.call(
        this.generatePeerConnectionId(vcs.roomTransientId),
        myMediaStream,
        {
          metadata: this.myMetadata,
        }
      );

      mediaConnection.on("stream", (remoteStream) => {
        if (this.remoteStreams.find((rs) => rs.stream.id === remoteStream.id))
          return;
        this.remoteStreams.push({
          stream: remoteStream,
          metadata: {
            isMuted: vcs.isMuted,
            isVideoDisabled: vcs.isVideoDisabled,
            name: vcs.name,
            roomTransientId: vcs.roomTransientId,
            picture: vcs.picture,
          },
        });
        this.peersMediaConnections.push(mediaConnection);
        this.rerender(this);
      });
    });
  }

  async handleWhenSomeoneLeft(data: VideoChatSubscriptionResult) {
    data.forEach((vcs) => {
      const maybePeerMediaConnection = this.peersMediaConnections.find(
        (pmc) => pmc.metadata.roomTransientId === vcs.roomTransientId
      );

      if (maybePeerMediaConnection) {
        maybePeerMediaConnection.close();
        this.peersMediaConnections = this.peersMediaConnections.filter(
          (pmc) => pmc.metadata.roomTransientId !== vcs.roomTransientId
        );
      }

      this.remoteStreams = this.remoteStreams.filter(
        (rs) => rs.metadata.roomTransientId !== vcs.roomTransientId
      );
    });

    this.rerender(this);
  }

  async handleWhenSomeoneStateChanged(data: VideoChatSubscriptionResult) {
    this.remoteStreams.forEach((rs) => {
      const maybeChangedState = data.find(
        (s) => s.roomTransientId === rs.metadata.roomTransientId
      );

      if (maybeChangedState) {
        Object.assign(rs.metadata, maybeChangedState);
      }
    });

    this.rerender(this);
  }

  async toggleVideo() {
    const newVideoDisabledState = !this.isVideoDisabled;
    if (newVideoDisabledState) {
      this.myMediaStream?.getVideoTracks().forEach((t) => {
        t.enabled = false;
        setTimeout(() => {
          t.stop();
        }, 100);
      });
    } else {
      if (!this.isMuted)
        this.myMediaStream?.getAudioTracks().forEach((t) => t.stop());
      if (this.myMediaStream.active)
        this.myMediaStream.getTracks().forEach((t) => t.stop());

      try {
        this.myMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: !this.isMuted,
        });
      } catch {
        return;
      }

      const [audioTrack] = this.myMediaStream.getAudioTracks();
      const [videoTrack] = this.myMediaStream.getVideoTracks();

      this.peersMediaConnections.forEach((pmc) => {
        const audioSender = pmc.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === audioTrack?.kind);
        const videoSender = pmc.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === videoTrack?.kind);

        audioSender?.replaceTrack(audioTrack);
        videoSender?.replaceTrack(videoTrack);
      });
    }

    this.isVideoDisabled = newVideoDisabledState;
    window.localStorage.setItem(
      this.LOCAL_STORAGE_VIDEO_CALL_VIDEO_DISABLED_KEY,
      JSON.stringify(newVideoDisabledState)
    );

    this.rerender(this);
  }

  async toggleAudio() {
    const newIsMutedState = !this.isMuted;
    if (newIsMutedState) {
      this.myMediaStream?.getAudioTracks().forEach((t) => {
        t.enabled = false;
        setTimeout(() => {
          t.stop();
        }, 100);
      });
    } else {
      if (!this.isVideoDisabled)
        this.myMediaStream?.getVideoTracks().forEach((t) => t.stop());
      if (this.myMediaStream.active)
        this.myMediaStream.getTracks().forEach((t) => t.stop());

      try {
        this.myMediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: !this.isVideoDisabled,
        });
      } catch {
        return;
      }

      const [audioTrack] = this.myMediaStream.getAudioTracks();
      const [videoTrack] = this.myMediaStream.getVideoTracks();

      if (!audioTrack) {
        return;
      }

      this.peersMediaConnections.forEach((pmc) => {
        const audioSender = pmc.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === audioTrack?.kind);
        const videoSender = pmc.peerConnection
          .getSenders()
          .find((s) => s.track?.kind === videoTrack?.kind);

        audioSender?.replaceTrack(audioTrack);
        videoSender?.replaceTrack(videoTrack);
      });
    }

    this.isMuted = newIsMutedState;
    window.localStorage.setItem(
      this.LOCAL_STORAGE_VIDEO_CALL_MUTED_KEY,
      JSON.stringify(newIsMutedState)
    );

    this.rerender(this);
  }

  private handleSomeoneCalled(mediaConnection: PeerMediaConnection) {
    mediaConnection.answer(
      this.myMediaStream ??
        new MediaStream([
          this.createEmptyAudioTrack(),
          this.createEmptyVideoTrack({ width: 300, height: 300 }),
        ])
    );

    mediaConnection.on("stream", (remoteStream) => {
      if (this.remoteStreams.find((rs) => rs.stream.id === remoteStream.id))
        return;
      this.remoteStreams.push({
        stream: remoteStream,
        metadata: mediaConnection.metadata,
      });
      this.peersMediaConnections.push(mediaConnection);
      this.rerender(this);
    });
  }

  cleanUp() {
    this.peer.disconnect();
    this.peer.destroy();
    this.myMediaStream.getTracks().forEach((t) => t.stop());
    this.peersMediaConnections.forEach((pmc) => {
      pmc.close();
      pmc.removeAllListeners();
    });
    this.remoteStreams = [];
  }
}

export default VideoCallPeer;
