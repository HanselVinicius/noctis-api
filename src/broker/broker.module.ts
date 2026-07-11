import { Module } from "@nestjs/common";
import { RabbitMQBrokerService } from "./rabbitmq.broker.service";

@Module({
  providers: [
    RabbitMQBrokerService
  ],
  exports: [
    RabbitMQBrokerService
  ],
})
export class BrokerModule {}