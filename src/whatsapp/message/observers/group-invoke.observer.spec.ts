import { GroupInvokeObserver } from './group-invoke.observer';
import { WASocket, WAMessage } from '@whiskeysockets/baileys';

describe('GroupInvokeObserver', () => {
  let observer: GroupInvokeObserver;
  let sock: Partial<WASocket>;

  beforeEach(() => {
    observer = new GroupInvokeObserver();

    sock = {
      sendMessage: jest.fn().mockResolvedValue(undefined),
      groupMetadata: jest.fn().mockResolvedValue({
        id: 'group@g.us',
        subject: 'test',
        participants: [
          { id: '551111111111@s.whatsapp.net' },
          { id: '552222222222@s.whatsapp.net' },
          { id: 'status@broadcast' }
        ]
      })
    };
  });

  function createMessage(overrides: Partial<WAMessage>): WAMessage {
    return {
      key: {
        remoteJid: 'group@g.us',
        fromMe: true,
        id: 'msg1',
        ...overrides.key
      },
      message: {},
      ...overrides
    } as WAMessage;
  }

  it('should mention all group participants when !invoke is sent by the bot owner', async () => {
    const message = createMessage({
      message: {
        conversation: '!invoke'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.groupMetadata).toHaveBeenCalledWith('group@g.us');
    expect(sock.sendMessage).toHaveBeenCalledTimes(1);

    const call = (sock.sendMessage as jest.Mock).mock.calls[0];

    expect(call[0]).toBe('group@g.us');

    expect(call[1].mentions).toEqual([
      '551111111111@s.whatsapp.net',
      '552222222222@s.whatsapp.net'
    ]);

    expect(call[1].text).toContain('@551111111111');
    expect(call[1].text).toContain('@552222222222');
  });

  it('should not run if message is not from a group', async () => {
    const message = createMessage({
      key: {
        remoteJid: '551199999999@s.whatsapp.net'
      },
      message: {
        conversation: '!invoke'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
    expect(sock.groupMetadata).not.toHaveBeenCalled();
  });

  it('should not run if message was not sent by the bot owner', async () => {
    const message = createMessage({
      key: {
        fromMe: false,
        remoteJid: '@g.us'
      },
      message: {
        conversation: '!invoke'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });

  it('should not run if command is different from !invoke', async () => {
    const message = createMessage({
      message: {
        conversation: '!hello'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
    expect(sock.groupMetadata).not.toHaveBeenCalled();
  });

  it('should ignore empty messages safely', async () => {
    const message = createMessage({
      message: undefined as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });

  it('should not send message if group has no valid participants', async () => {
    (sock.groupMetadata as jest.Mock).mockResolvedValueOnce({
      participants: [{ id: 'status@broadcast' }]
    });

    const message = createMessage({
      message: {
        conversation: '!invoke'
      } as any
    });

    await observer.onMessage(sock as WASocket, message);

    expect(sock.sendMessage).not.toHaveBeenCalled();
  });
});
