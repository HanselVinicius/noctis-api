import { WAMessage, WASocket } from '@whiskeysockets/baileys';

export interface MessageObserver {
  name: string;

  onMessage(
    sock: WASocket,
    message: WAMessage
  ): Promise<void> | void;
}
