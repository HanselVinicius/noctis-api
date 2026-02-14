import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Traced } from 'src/config/Traced';
import { ApiSecurityGuard } from 'src/middleware/security.middleware';

@Controller('whatsapp')
@UseGuards(ApiSecurityGuard)
export class WhatsappController {
  constructor(private readonly whatsapp: WhatsappService) {}

  @Post()
  @Traced('send-message')
  async send(@Body() body: { number: string; message: string }) {
    const jid = `${body.number}@s.whatsapp.net`;
    await this.whatsapp.sendMessage(jid, body.message);

    return { success: true };
  }
}
