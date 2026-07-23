import { WAMessage, WASocket } from '@whiskeysockets/baileys';
import { MessageObserver } from '../message.observer';
import * as brokerService from 'src/broker/broker.service';
import { BrokerMessage } from 'src/broker/BrokerMessage';
import { Inject, Injectable } from '@nestjs/common';
import { BrokerServiceToken } from 'src/broker/broker.service';

@Injectable()
export class SendToMessageBrokerObserver implements MessageObserver {
  name = 'send-broker';

  constructor(
    @Inject(BrokerServiceToken)
    private readonly brokerService: brokerService.BrokerService,
  ) {}

  async onMessage(_: WASocket, message: WAMessage) {
    if (!message.message) return;
    if (!message.key) return;
    if (message.key.fromMe) return;
    if (!message.key.remoteJidAlt) return;
    const from = message.key.remoteJidAlt!.split('@')[0];
    const isText = !!message.message.conversation;

    if (!isText) return;

    const brokerMessage = {
      fromId: from,
      message: message.message.conversation,
    } as BrokerMessage;

    await this.brokerService.send(brokerMessage);
  }
}
