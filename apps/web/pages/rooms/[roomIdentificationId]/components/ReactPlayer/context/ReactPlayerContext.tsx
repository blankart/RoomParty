import { VideoPlatform } from "@RoomParty/prisma-client";
import { APP_NAME } from "@RoomParty/shared-lib";
import useLocalStorage from "@web/hooks/useLocalStorage";
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type ReactPlayer from "react-player";
import { ReactPlayerProps } from "react-player";
import isMobile from "./isMobile";
export interface ReactPlayerContextState {
  reactPlayerProps: ReactPlayerProps & {
    reactPlayerRef: RefObject<ReactPlayer>;
  };
  setUrl: (newUrl?: string) => any;
  setVideoPlatform: (newVideoPlatform: VideoPlatform | undefined) => any;
  getInternalPlayer: () => Record<string, any> | undefined;
  playVideo: () => void;
  pauseVideo: () => void;
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
  setUrl: () => ({}),
  getInternalPlayer: () => ({}),
  playVideo() {},
  pauseVideo() {},
  seekTo() {},
  setVolume() {},
  setDuration() {},
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
    case "Facebook":
      return isMobile();
    default:
      return true;
  }
}

export function ReactPlayerProvider(props: {
  children?: React.ReactNode;
  reactPlayerRef: RefObject<ReactPlayer>;
}) {
  const { reactPlayerRef } = props;
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

  const [localStorageSoundState, setLocalStorageSoundState] = useLocalStorage(
    APP_NAME + "-volume-state",
    { isMuted: false, volume: 100 }
  );

  function setUrl(newUrl?: string) {
    setIsReady(false);
    setHasEnded(false);
    setScrubTime(0);
    _setUrl(newUrl);
  }

  useEffect(() => {
    if (hasEnded) seekTo(duration);
  }, [hasEnded]);

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

  function playVideo() {
    Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.playVideo?.(),
      (reactPlayerRef as any)?.current?.player?.player?.player?.play?.(),
    ])
      .then(() => {
        setIsPlayed(true);
      })
      .catch(console.warn);
  }

  function pauseVideo() {
    Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.pauseVideo?.(),
      (reactPlayerRef as any)?.current?.player?.player?.player?.pause?.(),
    ])
      .then(() => {
        setIsPlayed(false);
      })
      .catch(console.warn);
  }

  function seekTo(
    time: number,
    type?: "seconds",
    shouldPauseAfterScrub = true
  ) {
    Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.seek?.(
        time,
        type
      ),
      (reactPlayerRef as any)?.current?.player?.player?.player?.seekTo?.(
        time,
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

  function setVolume(volume: number, setMuteState = true) {
    Promise.all([
      (reactPlayerRef as any)?.current?.player?.player?.player?.setVolume?.(
        volumeFromControlComponentToReactPlayerVolume(videoPlatform, volume)
      ),
    ])
      .then(() => {
        setLocalStorageSoundState({ ...localStorageSoundState, volume });
        _setVolume(volume);
        setMuteState && setMuted(volume === 0);
      })
      .catch(console.warn);
  }

  function setMuted(muted: boolean) {
    Promise.all([
      (() => {
        if (muted) {
          (reactPlayerRef as any)?.current?.player?.player?.player?.setMuted?.(
            true
          );
          (reactPlayerRef as any)?.current?.player?.player?.player?.mute?.();
        } else {
          (reactPlayerRef as any)?.current?.player?.player?.player?.setMuted?.(
            false
          );
          (reactPlayerRef as any)?.current?.player?.player?.player?.unMute?.();
          (reactPlayerRef as any)?.current?.player?.player?.player?.unmute?.();
        }
      })(),
    ])
      .then(() => {
        setLocalStorageSoundState({
          ...localStorageSoundState,
          isMuted: muted,
        });
        _setIsMuted(muted);
      })
      .catch(console.warn);
  }

  useEffect(() => {
    setVolume(localStorageSoundState.volume, false);
    setMuted(localStorageSoundState.isMuted);
  }, [isReady, videoPlatform]);

  return (
    <ReactPlayerContext.Provider
      value={{
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
          },
          onBuffer() {
            setIsBuffering(true);
          },
          onBufferEnd() {
            setIsBuffering(false);
          },
          onEnded() {
            setHasEnded(true);
            pauseVideo();
          },
          onReady() {
            setIsReady(true);
          },
          onPlay() {
            if (hasInitiallyPlayed || !isMobile()) return;
            setHasInitiallyPlayed(true);
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
