import { VideoPlatform } from "@RoomParty/prisma-client";
import { APP_NAME } from "@RoomParty/shared-lib";
import useLocalStorage from "@web/hooks/useLocalStorage";
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type ReactPlayer from "react-player";
import { ReactPlayerProps } from "react-player";
import isMobile from "./isMobile";
export interface ReactPlayerContextState {
  reactPlayerProps: ReactPlayerProps & {
    reactPlayerRef: RefObject<ReactPlayer>;
  };
  reactPlayerWithControlsWrapperRef: RefObject<HTMLDivElement>;
  setUrl: (newUrl?: string) => any;
  setVideoPlatform: (newVideoPlatform: VideoPlatform | undefined) => any;
  getInternalPlayer: () => Record<string, any> | undefined;
  playVideo: () => void;
  pauseVideo: () => void;
  toggleFullScreen: () => void;
  seekTo: (
    time: number,
    type?: "seconds",
    shouldPauseAfterScrub?: boolean
  ) => void;
  setDuration: (time: number) => void;
  setVolume: (time: number) => void;
  setMuted: (muted: boolean) => void;
  duration: number;
  url?: string;
  videoPlatform?: VideoPlatform;
  hasEnded: boolean;
  hasError: boolean;
  isBuffering: boolean;
  isPlayed: boolean;
  scrubTime: number;
  isReady: boolean;
  isLive: boolean;
  volume: number;
  isMuted: boolean;
  hasInitiallyPlayed: boolean;
}

const ReactPlayerContext = createContext<ReactPlayerContextState>({
  reactPlayerProps: {
    reactPlayerRef: { current: null },
  },
  reactPlayerWithControlsWrapperRef: { current: null },
  setUrl: () => ({}),
  getInternalPlayer: () => ({}),
  playVideo() {},
  pauseVideo() {},
  seekTo() {},
  setVolume() {},
  setDuration() {},
  toggleFullScreen() {},
  setMuted() {},
  setVideoPlatform() {},
  duration: 0,
  hasEnded: false,
  isBuffering: false,
  isPlayed: false,
  hasError: false,
  isReady: false,
  isLive: false,
  scrubTime: 0,
  volume: 100,
  isMuted: false,
  hasInitiallyPlayed: false,
});

export function useReactPlayerContext() {
  return useContext(ReactPlayerContext);
}

function seekToFromControlComponentToReactPlayerSeekTo(
  videoPlatform: VideoPlatform | undefined,
  time: number,
  type?: "seconds"
) {
  switch (videoPlatform) {
    case "SoundCloud":
      return time * 1_000;
    default:
      return time;
  }
}

function volumeFromControlComponentToReactPlayerVolume(
  videoPlatform: VideoPlatform | undefined,
  volume: number
) {
  switch (videoPlatform) {
    case "Youtube":
      return volume;
    case "Twitch":
    case "Facebook":
    case "Vimeo":
    case "Mixcloud":
      return volume / 100;
    default:
      return volume;
  }
}

function getShouldClickTheVideoFirstOnReadyOrChangeUrl(
  videoPlatform?: VideoPlatform
) {
  switch (videoPlatform) {
    case "Vimeo":
    case "Mixcloud":
    case "Twitch":
      return false;
    case "Youtube":
      return isMobile();
    case "Facebook":
    default:
      return true;
  }
}

export function ReactPlayerProvider(props: {
  children?: React.ReactNode;
  reactPlayerRef: RefObject<ReactPlayer>;
}) {
  const { reactPlayerRef } = props;
  const reactPlayerWithControlsWrapperRef = useRef<HTMLDivElement>(null);
  const [url, _setUrl] = useState<string | undefined>();
  const [videoPlatform, setVideoPlatform] = useState<
    VideoPlatform | undefined
  >();
  const [duration, setDuration] = useState<number>(0);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, _setVolume] = useState(100);
  const [isMuted, _setIsMuted] = useState(false);
  const [hasInitiallyPlayed, setHasInitiallyPlayed] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [localStorageSoundState, setLocalStorageSoundState] = useLocalStorage(
    APP_NAME + "-volume-state",
    { isMuted: false, volume: 100 }
  );

  const lastVolumeBeforeMuted = useRef<number>(localStorageSoundState.volume);

  useEffect(() => {
    if (!reactPlayerWithControlsWrapperRef.current) return;
    reactPlayerWithControlsWrapperRef.current.onfullscreenchange = () => {
      setIsFullScreen(!isFullScreen);
    };
    (
      reactPlayerWithControlsWrapperRef as any
    ).current.onwebkitfullscreenchange = () => {
      setIsFullScreen(!isFullScreen);
    };
  }, [isFullScreen]);

  async function toggleFullScreen() {
    const newValue = !isFullScreen;
    if (newValue) {
      await Promise.all([
        reactPlayerWithControlsWrapperRef.current!.requestFullscreen?.() ??
          (
            reactPlayerWithControlsWrapperRef as any
          ).current!.webkitRequestFullScreen?.(),
      ]);
    } else {
      await Promise.all([
        (() => {
          document.exitFullscreen?.() ??
            (document as any).webkitExitFullscreen?.();
        })(),
      ]);
    }
  }

  function setUrl(newUrl?: string) {
    setIsReady(false);
    setHasEnded(false);
    setScrubTime(0);
    _setUrl(newUrl);
  }

  function getInternalPlayer() {
    return reactPlayerRef?.current?.getInternalPlayer();
  }

  const shouldClickTheVideoFirstOnReadyOrChangeUrl = useMemo(
    () => getShouldClickTheVideoFirstOnReadyOrChangeUrl(videoPlatform),
    [videoPlatform]
  );

  useEffect(() => {
    setHasInitiallyPlayed(!shouldClickTheVideoFirstOnReadyOrChangeUrl);
  }, [shouldClickTheVideoFirstOnReadyOrChangeUrl]);

  async function playVideo() {
    setIsPlayed(true);
    return Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.playVideo?.(),
      (reactPlayerRef as any)?.current?.player?.player?.player?.play?.(),
    ]).catch(console.warn);
  }

  async function pauseVideo() {
    setIsPlayed(false);
    return Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.pauseVideo?.(),
      (reactPlayerRef as any)?.current?.player?.player?.player?.pause?.(),
    ]).catch(console.warn);
  }

  async function seekTo(
    time: number,
    type?: "seconds",
    shouldPauseAfterScrub = true
  ) {
    return Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.seek?.(
        seekToFromControlComponentToReactPlayerSeekTo(
          videoPlatform,
          time,
          type
        ),
        type
      ),
      (reactPlayerRef as any)?.current?.player?.player?.player?.seekTo?.(
        seekToFromControlComponentToReactPlayerSeekTo(
          videoPlatform,
          time,
          type
        ),
        type
      ),
      (
        reactPlayerRef as any
      )?.current?.player?.player?.player?.setCurrentTime?.(time),
    ])
      .then(() => {
        setHasEnded(false);
        setScrubTime(time);
        shouldPauseAfterScrub && pauseVideo();
        !shouldPauseAfterScrub && playVideo();
      })
      .catch(console.warn);
  }

  async function setVolume(volume: number, setMuteState = true) {
    return Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.setVolume?.(
        volumeFromControlComponentToReactPlayerVolume(videoPlatform, volume)
      ),
    ])
      .then(() => {
        setLocalStorageSoundState({ ...localStorageSoundState, volume });
        _setVolume(volume);
        setMuteState && _setIsMuted(volume === 0);
      })
      .catch(console.warn);
  }

  async function setMuted(muted: boolean) {
    if (muted) {
      lastVolumeBeforeMuted.current = volume;
    }

    return setVolume(muted ? 0 : lastVolumeBeforeMuted.current).then(() => {
      setLocalStorageSoundState({
        ...localStorageSoundState,
        isMuted: muted,
      });
      _setIsMuted(muted);
    });
  }

  useEffect(() => {
    setVolume(localStorageSoundState.volume, false);
    setMuted(localStorageSoundState.isMuted);
    if (getInternalPlayer()?.getMuted?.()) {
      getInternalPlayer()?.setMuted?.(false);
    }
  }, [isReady, videoPlatform]);

  return (
    <ReactPlayerContext.Provider
      value={{
        toggleFullScreen,
        reactPlayerWithControlsWrapperRef,
        reactPlayerProps: {
          reactPlayerRef,
          url,
          onDuration(duration) {
            setHasInitiallyPlayed(!shouldClickTheVideoFirstOnReadyOrChangeUrl);
            setHasError(false);
            setDuration(duration);
            setHasEnded(false);
            const isLive =
              duration === Infinity ||
              getInternalPlayer()?.getVideoData?.()?.isLive;

            setIsLive(isLive);
            if (getInternalPlayer()?.getMuted?.()) {
              getInternalPlayer()?.setMuted?.(false);
            }
          },
          onBuffer() {
            setIsBuffering(true);
          },
          onBufferEnd() {
            setIsBuffering(false);
          },
          onEnded() {
            setHasEnded(true);
            seekTo(duration);
            pauseVideo();
          },
          onReady(player) {
            const isLive =
              duration === Infinity ||
              getInternalPlayer()?.getVideoData?.()?.isLive;
            setIsLive(isLive);
            setIsReady(true);
            setDuration(player.getDuration());
          },
          onPlay() {
            if (hasInitiallyPlayed) return;
            setHasInitiallyPlayed(true);
            reactPlayerRef.current?.getCurrentTime() &&
              setScrubTime(reactPlayerRef.current?.getCurrentTime());
            playVideo();
          },
          onError() {
            setHasError(true);
          },
        },
        videoPlatform,
        setVideoPlatform,
        hasInitiallyPlayed,
        isMuted,
        setMuted,
        hasError,
        setVolume,
        isPlayed,
        scrubTime,
        hasEnded,
        isBuffering,
        url,
        duration,
        setDuration,
        setUrl,
        getInternalPlayer,
        playVideo,
        pauseVideo,
        seekTo,
        isReady,
        isLive,
        volume,
      }}
    >
      {props.children}
    </ReactPlayerContext.Provider>
  );
}
