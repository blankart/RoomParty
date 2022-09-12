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

    const { id, userName, scrubTime, url, set, sessionId, type } = useRoomsStore(
        (s) => ({
            id: s.id,
            userName: s.userName,
            isPlayed: s.isPlayed,
            url: s.url,
            scrubTime: s.scrubTime,
            set: s.set,
            sessionId: s.sessionId,
            type: s.type,
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
                    setWatchState({
                        isPlayed: true,
                        url: data.url,
                    });
                }
            },
        }
    );

    function initializeWatchState(
        newState: Pick<RoomsStore, "scrubTime" | "isPlayed">
    ) {
        youtubePlayerRef?.current?.player?.player?.player?.seekTo(
            newState.scrubTime,
            "seconds"
        );


        if (newState.isPlayed) {
            youtubePlayerRef?.current?.player?.player?.player?.playVideo();
        } else {
            youtubePlayerRef?.current?.player?.player?.player?.pauseVideo();
        }
    }

    function setWatchState(
        newState: Partial<Pick<RoomsStore, "scrubTime" | "isPlayed" | "url" | "type">>
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

    function onStart() {
        initializeWatchState({
            scrubTime: scrubTime ?? 0,
            isPlayed: type !== 'PAUSED'
        })
    }

    const control = useControlMutation()

    function onPause() {
        url &&
            control({
                id: id!,
                statusObject: {
                    sessionId: sessionId,
                    time: youtubePlayerRef?.current?.getCurrentTime() ?? 0,
                    type: "PAUSED",
                    name: userName!,
                    url: url,
                },
            });
    }

    function onPlay() {
        url &&
            control({
                id: id!,
                statusObject: {
                    sessionId: sessionId,
                    type: "PLAYED",
                    time: youtubePlayerRef?.current?.getCurrentTime() ?? 0,
                    name: userName!,
                    url: url,
                },
            });
    }


    function onSeek(time: number) {
        url &&
            control({
                id: id!,
                statusObject: {
                    sessionId: sessionId,
                    name: userName!,
                    type: "SEEK_TO",
                    time,
                    url: url,
                },
            });
    }

    return {
        url,
        sessionId,
        id,
        userName,
        youtubePlayerRef,
        control,
        setWatchState,
        onStart,
        onPause,
        onPlay,
        onSeek,
    }
}