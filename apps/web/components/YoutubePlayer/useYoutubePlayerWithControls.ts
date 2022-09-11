import { PlayerStatus } from "trpc";
import { trpc } from "@web/api";
import { useRef } from "react";
import { RoomsStore, useRoomsStore } from "@web/store/rooms";
import shallow from "zustand/shallow";

import { YoutubePlayerWithControlsProps } from "./YoutubePlayerWithControls";

export function useControlMutation() {
    const { mutate: _control } = trpc.useMutation(["player.control"]);

    function control(
        param: Omit<Parameters<typeof _control>[0], "statusObject"> & {
            statusObject: PlayerStatus;
        }
    ) {
        _control(param);
    }

    return control
}


export default function useYoutubePlayerWithControls(props: YoutubePlayerWithControlsProps) {
    const youtubePlayerRef = useRef<any>(null);

    const { id, userName, scrubTime, url, set, playerStatus, sessionId } = useRoomsStore(
        (s) => ({
            id: s.id,
            userName: s.userName,
            isPlayed: s.isPlayed,
            url: s.url,
            scrubTime: s.scrubTime,
            set: s.set,
            playerStatus: s.playerStatus,
            sessionId: s.sessionId,
        }),
        shallow
    );

    trpc.useSubscription(
        ["player.statusSubscription", { id: id!, name: userName! }],
        {
            enabled: !!id,
            onNext(data) {
                if (data.type === "CHANGE_URL") {
                    setWatchState({ isPlayed: false, scrubTime: 0, url: data.url });
                }

                if (data.sessionId === sessionId) return;

                if (data.type === "PAUSED") {
                    setWatchState({
                        isPlayed: false,
                        scrubTime: data.time,
                        url: data.url,
                    });
                }

                if (data.type === "PLAYED") {
                    setWatchState({ isPlayed: true, url: data.url });
                }
            },
        }
    );


    function setWatchState(
        newState: Partial<Pick<RoomsStore, "scrubTime" | "isPlayed" | "url">>
    ) {
        if (newState.scrubTime && newState.scrubTime !== scrubTime) {
            youtubePlayerRef?.current?.player?.player?.player?.seekTo(
                newState.scrubTime,
                "seconds"
            );
        }

        if (typeof newState.isPlayed === "boolean") {
            if (newState.isPlayed) {
                youtubePlayerRef?.current?.player?.player?.player?.playVideo();
            } else {
                youtubePlayerRef?.current?.player?.player?.player?.pauseVideo();
            }
        }

        set({ ...newState });
    }

    const control = useControlMutation()

    return {
        url,
        sessionId,
        id,
        userName,
        playerStatus,
        youtubePlayerRef,
        control,
        setWatchState
    }
}