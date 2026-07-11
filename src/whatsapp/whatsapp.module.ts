import { Global, Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { AudioBlockObserver } from './message/observers/audio-block.observer';
import { MessageDispatcher } from './message/message.dispatcher';
import { GroupInvokeObserver } from './message/observers/group-invoke.observer';
import { BrokerModule } from 'src/broker/broker.module';
import { SendToMessageBrokerObserver } from './message/observers/send-to-message-broker.observer';

@Global()
@Module({
  imports: [BrokerModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    AudioBlockObserver,
    MessageDispatcher,
    GroupInvokeObserver,
    SendToMessageBrokerObserver,
  ],
  exports: [WhatsappService],
})
export class WhatsappModule {}
