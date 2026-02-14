import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { Injectable, Logger } from '@nestjs/common';
import { MessageObserver } from './message.observer';

@Injectable()
export class MessageDispatcher {
  private readonly logger = new Logger(MessageDispatcher.name);
  private observers: MessageObserver[] = [];

  register(observer: MessageObserver) {
    this.logger.log(`Observer registrado: ${observer.name}`);
    this.observers.push(observer);
  }

  async dispatch(sock: WASocket, message: WAMessage) {
    for (const obs of this.observers) {
      try {
        await obs.onMessage(sock, message);
      } catch (err) {
        this.logger.error(
          `Erro no observer ${obs.name}: ${err?.message || err}`
        );
      }
    }
  }
}
