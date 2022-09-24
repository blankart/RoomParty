import {
  ReactPlayerContextState,
  ReactPlayerProvider,
  useReactPlayerContext,
} from "../ReactPlayerContext";
import {
  act,
  renderHook,
  RenderResult,
  WaitForValueToChange,
} from "@testing-library/react-hooks";

import React from "react";
import { useRef } from "react";
import type ReactPlayerType from "react-player";
import ReactPlayer from "../../ReactPlayer";
import { describe, expect } from "@jest/globals";

function ReactPlayerChild() {
  const { reactPlayerProps } = useReactPlayerContext();
  return <ReactPlayer {...reactPlayerProps} />;
}

function ReactPlayerWrapper(props: { children: React.ReactNode }) {
  const ref = useRef<ReactPlayerType>(null);
  return (
    <ReactPlayerProvider reactPlayerRef={ref}>
      {props.children}
      <ReactPlayerChild />
    </ReactPlayerProvider>
  );
}

const MOCK_YT_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const MOCK_TW_URL = "https://www.twitch.tv/videos/1579518052";

describe("ReactPlayerContext", () => {
  let result: RenderResult<ReactPlayerContextState>;
  let waitForValueToChange: WaitForValueToChange;
  beforeEach(() => {
    const hook = renderHook(() => useReactPlayerContext(), {
      wrapper: ReactPlayerWrapper,
    });
    result = hook.result;
    waitForValueToChange = hook.waitForValueToChange;
  });

  test("getInternalPlayer must be defined", () => {
    expect(result.current.getInternalPlayer()).toBeDefined();
  });

  it("should change the current URL", async () => {
    act(() => {
      result.current.setUrl(MOCK_YT_URL);
    });

    expect(result.current.url).toBe(MOCK_YT_URL);
  });

  test("localStorageVolume should persist after changing urls", async () => {
    act(() => {
      result.current.setUrl(MOCK_YT_URL);
      result.current.setVolume(50);
    });

    await waitForValueToChange(() => result.current.volume);

    expect(result.current.volume).toBe(50);

    act(() => {
      result.current.setMuted(true);
    });

    await waitForValueToChange(() => result.current.isMuted);

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.setUrl(MOCK_TW_URL);
    });

    expect(result.current.url).toBe(MOCK_TW_URL);

    expect(result.current.volume).toBe(50);
    expect(result.current.isMuted).toBe(true);
  });
});
