import { WAMessage, WASocket, proto } from '@whiskeysockets/baileys';
import { MessageObserver } from '../message.observer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupInvokeObserver implements MessageObserver {
  name = 'group-invoke';

  async onMessage(sock: WASocket, message: WAMessage) {
    if (!message.message) return;

    const from = message.key.remoteJid!;
    const isGroup = from.endsWith('@g.us');
    if (!isGroup) return;

    if (!message.key.fromMe) return;

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      '';

    if (!text) return;
    if (text.trim().toLowerCase() !== '!invoke') return;

    const metadata = await sock.groupMetadata(from);

    const participants = metadata.participants
      .map(p => p.id)
      .filter(id => !id.includes('status'));

    if (!participants.length) return;

    const mentionText = participants.map(id => `@${id.split('@')[0]}`).join(' ');

    await sock.sendMessage(from, {
      text: `📢 summon geral:\n\n${mentionText}`,
      mentions: participants
    });
  }
}
