import { Global, Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AudioBlockObserver } from './message/observers/audio-block.observer';
import { MessageDispatcher } from './message/message.dispatcher';
import { GroupInvokeObserver } from './message/observers/group-invoke.observer';

@Global()
@Module({
  imports: [],
  controllers: [WhatsappController],
  providers: [WhatsappService,AudioBlockObserver,MessageDispatcher,GroupInvokeObserver],
  exports: [WhatsappService]
})
export class WhatsappModule {}
