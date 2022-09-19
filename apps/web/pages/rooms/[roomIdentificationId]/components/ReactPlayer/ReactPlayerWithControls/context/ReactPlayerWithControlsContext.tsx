import React, {
  createContext,
  createRef,
  RefObject,
  useContext,
  useRef,
} from "react";

import type ReactPlayer from "react-player";

interface ReactPlayerWithControlsContextState {
  reactPlayerRef: RefObject<ReactPlayer>;
  getInternalPlayer: () => any;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (time: number, type?: "seconds") => void;
}

export const ReactPlayerWithControlsContext =
  createContext<ReactPlayerWithControlsContextState>({
    reactPlayerRef: createRef<ReactPlayer>(),
    getInternalPlayer() {},
    playVideo() {},
    pauseVideo() {},
    seekTo() {},
  });

export const ReactPlayerWithControlsConsumer =
  ReactPlayerWithControlsContext.Consumer;

export function useReactPlayer() {
  return useContext(ReactPlayerWithControlsContext);
}

export function ReactPlayerProvider(props: { children?: React.ReactNode }) {
  const reactPlayerRef = useRef<ReactPlayer>(null);

  function getInternalPlayer() {
    return reactPlayerRef?.current?.getInternalPlayer();
  }

  function playVideo() {
    getInternalPlayer()?.playVideo?.() ?? getInternalPlayer()?.play?.();
  }

  function pauseVideo() {
    getInternalPlayer()?.pauseVideo?.() ?? getInternalPlayer()?.pause?.();
  }

  function seekTo(time: number, type?: "seconds") {
    getInternalPlayer()?.seek?.(time, type) ??
      getInternalPlayer()?.seekTo?.(time, type);
  }

  return (
    <ReactPlayerWithControlsContext.Provider
      value={{
        reactPlayerRef,
        getInternalPlayer,
        playVideo,
        pauseVideo,
        seekTo,
      }}
    >
      {props.children}
    </ReactPlayerWithControlsContext.Provider>
  );
}
