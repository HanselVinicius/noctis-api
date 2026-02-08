import { Controller, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Post()
  async send(@Body() body: { number: string; message: string }) {
    const jid = `${body.number}@s.whatsapp.net`;
    await this.whatsapp.sendMessage(jid, body.message);

    return { success: true };
  }
}
