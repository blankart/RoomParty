import React, {
  createContext,
  createRef,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";

import type ReactPlayer from "react-player";

interface ReactPlayerWithControlsContextState {
  reactPlayerRef: RefObject<ReactPlayer>;
  getInternalPlayer: () => any;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (time: number, type?: "seconds") => void;
  isPlayed: boolean;
  setIsPlayed: (v: boolean) => any;
  onDuration: (v: number) => any;
  scrubTime: number;
}

export const ReactPlayerWithControlsContext =
  createContext<ReactPlayerWithControlsContextState>({
    reactPlayerRef: createRef<ReactPlayer>(),
    getInternalPlayer() {},
    playVideo() {},
    pauseVideo() {},
    seekTo() {},
    isPlayed: false,
    setIsPlayed() {},
    onDuration() {},
    scrubTime: 0,
  });

export const ReactPlayerWithControlsConsumer =
  ReactPlayerWithControlsContext.Consumer;

export function useReactPlayer() {
  return useContext(ReactPlayerWithControlsContext);
}

export function ReactPlayerProvider(props: { children?: React.ReactNode }) {
  const reactPlayerRef = useRef<ReactPlayer>(null);
  const [isPlayed, setIsPlayed] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

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
    getInternalPlayer()?.seek?.(time, type) ??
      getInternalPlayer()?.seekTo?.(time, type);
  }

  function onDuration(duration: number) {
    setScrubTime(duration);
  }

  return (
    <ReactPlayerWithControlsContext.Provider
      value={{
        reactPlayerRef,
        getInternalPlayer,
        playVideo,
        pauseVideo,
        seekTo,
        isPlayed,
        setIsPlayed,
        onDuration,
        scrubTime,
      }}
    >
      {props.children}
    </ReactPlayerWithControlsContext.Provider>
  );
}
