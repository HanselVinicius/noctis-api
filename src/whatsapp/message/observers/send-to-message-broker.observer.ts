import { WAMessage, WASocket } from "@whiskeysockets/baileys";
import { MessageObserver } from "../message.observer";
import * as brokerService from "src/broker/broker.service";
import { BrokerMessage } from "src/broker/BrokerMessage";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SendToMessageBrokerObserver implements MessageObserver {
  name = 'send-broker';

  constructor(private readonly brokerService: brokerService.BrokerService) {}

  async onMessage(sock: WASocket, message: WAMessage) {
    if (!message.message) return;
    if (!message.key) return;
    if (message.key.fromMe) return;

    const from = message.key.remoteJid!;
    const isText = !!message.message.conversation;

    if (!isText) return;

    const brokerMessage = {
      fromId: from,
      message: message.message.conversation
    } as BrokerMessage;

    await this.brokerService.send(brokerMessage);
  }
}