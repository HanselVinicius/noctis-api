import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    WASocket
} from '@whiskeysockets/baileys';
import * as qrcode from 'qrcode-terminal';
import P from 'pino';
import { Boom } from '@hapi/boom';
import { MessageDispatcher } from './message/message.dispatcher';
import { AudioBlockObserver } from './message/observers/audio-block.observer';
import { GroupInvokeObserver } from './message/observers/group-invoke.observer';
import { usePostgreSQLAuthState } from 'postgres-baileys';

@Injectable()
export class WhatsappService implements OnModuleInit {
    private readonly logger = new Logger(WhatsappService.name);
    private sock: WASocket | null = null;

    constructor(
        private readonly audioBlockObserver: AudioBlockObserver,
        private readonly messageDispatcher: MessageDispatcher,
        private readonly groupInvokeObserver: GroupInvokeObserver,
    ) { }

    async onModuleInit() {
        await this.connect();
        this.messageDispatcher.register(this.audioBlockObserver);
        this.messageDispatcher.register(this.groupInvokeObserver);
    }

    getSocket(): WASocket {
        if (!this.sock) {
            throw new Error('WhatsApp não conectado ainda');
        }
        return this.sock;
    }

    private async connect() {

        const { state, saveCreds } = await usePostgreSQLAuthState({
            host: String(process.env.POSTGRES_HOST),
            port: Number(process.env.POSTGRES_PORT),
            user: String(process.env.POSTGRES_USER),
            password: String(process.env.POSTGRES_PASSWORD),
            database: String(process.env.POSTGRES_DB),

        }, 'session_id_1');
        const { version } = await fetchLatestBaileysVersion();

        this.logger.log(`Iniciando conexão WhatsApp...`);

        const sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            logger: P({ level: 'silent' })
        });

        this.sock = sock;

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                this.logger.log('Escaneie o QR Code abaixo:');
                qrcode.generate(qr, { small: true });
            }

            if (connection === 'open') {
                this.logger.log('WhatsApp conectado com sucesso 🚀');
            }

            if (connection === 'close') {
                const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = reason !== DisconnectReason.loggedOut;

                this.logger.warn(`Conexão fechada. Motivo: ${reason}`);

                if (shouldReconnect) {
                    this.logger.log('Reconectando...');
                    this.connect();
                } else {
                    this.logger.error('Sessão desconectada. Apague ./baileys_auth e reconecte.');
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async (msg) => {
            if (msg.type !== 'notify') return;

            const message = msg.messages[0];

            if (!message.message) return;
            this.logger.log(`Chegou mensagem pra você: '${message.message.conversation}' de ${message.pushName}`)
            await this.messageDispatcher.dispatch(sock, message);
        });
    }

    async sendMessage(jid: string, text: string) {
        const sock = this.getSocket();
        await sock.sendMessage(jid, { text });
    }
}
