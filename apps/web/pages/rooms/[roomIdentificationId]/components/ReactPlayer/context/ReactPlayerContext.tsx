import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type ReactPlayer from "react-player";
import { ReactPlayerProps } from "react-player";

interface ReactPlayerContextState {
  reactPlayerProps: ReactPlayerProps & {
    reactPlayerRef: RefObject<ReactPlayer>;
  };
  setUrl: (newUrl?: string) => any;
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

function isMobile() {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
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

export function ReactPlayerProvider(props: { children?: React.ReactNode }) {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const [url, _setUrl] = useState<string | undefined>(undefined);
  const [duration, setDuration] = useState<number>(0);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [volume, _setVolume] = useState(100);
  const [isMuted, _setIsMuted] = useState(false);
  const [hasInitiallyPlayed, setHasInitiallyPlayed] = useState(!isMobile());
  const [hasError, setHasError] = useState(false);

  function setUrl(newUrl?: string) {
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

  function playVideo() {
    (reactPlayerRef as any)?.current?.player?.player?.player?.playVideo?.();
    (reactPlayerRef as any)?.current?.player?.player?.player?.play?.();
    setIsPlayed(true);
  }

  function pauseVideo() {
    (reactPlayerRef as any)?.current?.player?.player?.player?.pauseVideo?.();
    (reactPlayerRef as any)?.current?.player?.player?.player?.pause?.();
    setIsPlayed(false);
  }

  function seekTo(
    time: number,
    type?: "seconds",
    shouldPauseAfterScrub = true
  ) {
    (reactPlayerRef as any)?.current?.player?.player?.player?.seek?.(
      time,
      type
    );
    (reactPlayerRef as any)?.current?.player?.player?.player?.seekTo?.(
      time,
      type
    );
    setHasEnded(false);
    setScrubTime(time);
    shouldPauseAfterScrub && pauseVideo();
    !shouldPauseAfterScrub && playVideo();
  }

  function setVolume(volume: number) {
    (reactPlayerRef as any)?.current?.player?.player?.player?.setVolume?.(
      volume
    );
    _setVolume(volume);
    setMuted(volume === 0);
  }

  function setMuted(muted: boolean) {
    if (muted) {
      (reactPlayerRef as any)?.current?.player?.player?.player?.mute?.();
    } else {
      (reactPlayerRef as any)?.current?.player?.player?.player?.unMute?.();
    }
    _setIsMuted(muted);
  }

  useEffect(() => {
    const volume = (
      reactPlayerRef as any
    )?.current?.player?.player?.player?.getVolume?.();
    const isMuted = (
      reactPlayerRef as any
    )?.current?.player?.player?.player?.isMuted?.();
    _setVolume(volume);
    _setIsMuted(isMuted);
  }, [isReady]);

  return (
    <ReactPlayerContext.Provider
      value={{
        reactPlayerProps: {
          reactPlayerRef,
          url,
          onDuration(duration) {
            // if (isMobile()) setHasInitiallyPlayed(false);
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
