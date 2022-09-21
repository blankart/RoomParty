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
  seekTo: (time: number, type?: "seconds") => void;
  setDuration: (time: number) => void;
  setVolume: (time: number) => void;
  setMuted: (muted: boolean) => void;
  duration: number;
  url?: string;
  hasEnded: boolean;
  isBuffering: boolean;
  isPlayed: boolean;
  scrubTime: number;
  isReady: boolean;
  isLive: boolean;
  volume: number;
  isMuted: boolean;
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
  isReady: false,
  isLive: false,
  scrubTime: 0,
  volume: 100,
  isMuted: false,
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

  function setUrl(newUrl?: string) {
    setHasEnded(false);
    setScrubTime(0);
    _setUrl(newUrl);
  }

  useEffect(() => {
    if (isPlayed && scrubTime >= duration) pauseVideo();
    if (hasEnded || !url) {
      pauseVideo();
    }
  }, [hasEnded, url, isPlayed]);

  useEffect(() => {
    if (hasEnded) seekTo(duration);
  }, [hasEnded]);

  function getInternalPlayer() {
    return reactPlayerRef?.current?.getInternalPlayer();
  }

  function playVideo() {
    getInternalPlayer()?.playVideo?.() ?? getInternalPlayer()?.play?.();
    setIsPlayed(true);
  }

  function pauseVideo() {
    getInternalPlayer()?.pauseVideo?.() ?? getInternalPlayer()?.pause?.();
    setIsPlayed(false);
  }

  function seekTo(time: number, type?: "seconds") {
    setHasEnded(false);
    setScrubTime(time);
    getInternalPlayer()?.seek?.(time, type) ??
      getInternalPlayer()?.seekTo?.(time, type);
    pauseVideo();
  }

  function setVolume(volume: number) {
    getInternalPlayer()?.setVolume?.(volume);
    _setVolume(volume);
    setMuted(volume === 0);
  }

  function setMuted(muted: boolean) {
    if (muted) {
      getInternalPlayer()?.mute?.();
    } else {
      getInternalPlayer()?.unMute?.();
    }
    _setIsMuted(muted);
  }

  useEffect(() => {
    const volume = getInternalPlayer()?.getVolume?.();
    const isMuted = getInternalPlayer()?.isMuted?.();
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
          },
          onReady() {
            setIsReady(true);
          },
        },
        isMuted,
        setMuted,
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
