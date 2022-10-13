export interface TemporaryChat {
  name: string;
  message: string;
  color?: string;
  isSystemMessage?: boolean;
  userId?: string;
  roomTransientId?: string;
}
