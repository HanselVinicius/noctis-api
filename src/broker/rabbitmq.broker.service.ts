import { Injectable } from "@nestjs/common";
import { BrokerService } from "./broker.service";
import { BrokerMessage } from "./BrokerMessage";
import amqp from "amqplib";

@Injectable()
export class RabbitMQBrokerService implements BrokerService {
  private readonly amqpUrl: string;
  private readonly exchangeName: string;

  constructor() {
    this.amqpUrl = process.env.RABBITMQ_URL || "amqp://localhost";
    this.exchangeName = process.env.RABBITMQ_EXCHANGE || "direct.messages.incoming";
  }

  async send(message: BrokerMessage): Promise<void> {
    const connection = await amqp.connect(this.amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(this.exchangeName, "direct", { durable: true });
    channel.sendToExchange(this.exchangeName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    await channel.close();
    await connection.close();
  }
}