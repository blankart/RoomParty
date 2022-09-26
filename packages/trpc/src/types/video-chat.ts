export type VideoChatParticipant = {
  roomTransientId: string;
  name: string;
  picture?: string;
  isMuted: boolean;
  isVideoDisabled: boolean;
};
