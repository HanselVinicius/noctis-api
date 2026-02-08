import { WAMessage, WASocket, proto } from '@whiskeysockets/baileys';
import { MessageObserver } from '../message.observer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AudioBlockObserver implements MessageObserver {
    name = 'audio-block';

    async onMessage(sock: WASocket, message: WAMessage) {
        if (!message.message) return;
        if (!message.key) return;
        if (message.key.fromMe) return;

        const from = message.key.remoteJid!;
        const isAudio =
            !!message.message.audioMessage

        if (!isAudio) return;

        const response =
            `> SISTEMA: este número não recebe áudios. A função de bloqueio de áudio está ativada para manter o chat organizado. Envie sua mensagem em texto, por favor.`;

        await sock.sendMessage(from, { text: response }, { quoted: message });
    }
}
