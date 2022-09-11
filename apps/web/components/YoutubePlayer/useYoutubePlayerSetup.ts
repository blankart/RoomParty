import { useRef, useState } from "react";
import shallow from "zustand/shallow";
import { useRoomsStore } from "@web/store/rooms";
import { useControlMutation } from "./useYoutubePlayerWithControls";
import { YoutubePlayerSetupProps } from "./YoutubePlayerSetup";

export function useYoutubePlayerSetup(props: YoutubePlayerSetupProps) {
    const [focused, setFocused] = useState(false);
    const youtubeInputRef = useRef<HTMLInputElement>(null);

    const { id, userName, sessionId } = useRoomsStore(
        (s) => ({
            id: s.id,
            userName: s.userName,
            sessionId: s.sessionId,
        }),
        shallow
    );

    const control = useControlMutation();

    return {
        focused,
        setFocused,
        youtubeInputRef,
        id,
        userName,
        control,
        sessionId,
    };
}