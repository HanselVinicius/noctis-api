import { Module } from '@nestjs/common';
import { RabbitMQBrokerService } from './rabbitmq.broker.service';
import { BrokerServiceToken } from './broker.service';

@Module({
  imports: [],
  providers: [
    {
      provide: BrokerServiceToken,
      useClass: RabbitMQBrokerService,
    },
  ],
  exports: [BrokerServiceToken],
})
export class BrokerModule {}
