import { AudioBlockObserver } from './audio-block.observer';
import { WASocket, WAMessage } from '@whiskeysockets/baileys';

describe('AudioBlockObserver', () => {
  let observer: AudioBlockObserver;
  let sock: Partial<WASocket>;

  beforeEach(() => {
    observer = new AudioBlockObserver();

    sock = {
      sendMessage: jest.fn().mockResolvedValue(undefined)
    };
  });

  function createMessage(overrides: Partial<WAMessage>): WAMessage {
    return {
      key: {
        remoteJid: '5511999999999@s.whatsapp.net',
        fromMe: false,
        id: 'msg1',
        ...overrides.key
      },
      message: {},
      ...overrides
    } as WAMessage;
  }

  it('should send a warning message when an audio is received', async () => {
    const message = createMessage({
      message: {
        audioMessage: {
          mimetype: 'audio/ogg'
        }
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).toHaveBeenCalledTimes(1);
    expect(sock.sendMessage).toHaveBeenCalledWith(
      '5511999999999@s.whatsapp.net',
      expect.objectContaining({
        text: expect.stringContaining('não recebe áudios')
      }),
      expect.objectContaining({
        quoted: message
      })
    );
  });

  it('should not send a message when the incoming message is not audio', async () => {
    const message = createMessage({
      message: {
        conversation: 'regular text'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });

  it('should not send a message if the message was sent by the bot itself', async () => {
    const message = createMessage({
      key: {
        fromMe: true
      },
      message: {
        audioMessage: {}
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });

  it('should safely ignore messages without message content', async () => {
    const message = createMessage({
      message: undefined as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });
});
