import { Injectable } from '@nestjs/common';
import { BrokerService } from './broker.service';
import { BrokerMessage } from './BrokerMessage';
import amqp from 'amqplib';

@Injectable()
export class RabbitMQBrokerService implements BrokerService {
  private readonly amqpUrl: string;
  private readonly exchangeName: string;
  private readonly routingKey: string;
  private readonly rabbitmqUsername: string;
  private readonly rabbitmqPassword: string;

  constructor() {
    this.rabbitmqUsername = process.env.RABBITMQ_USERNAME || 'admin';
    this.rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'password';
    this.amqpUrl =
      process.env.RABBITMQ_URL ||
      `amqp://${this.rabbitmqUsername}:${this.rabbitmqPassword}@localhost:5672`;
    this.exchangeName =
      process.env.RABBITMQ_EXCHANGE || 'direct.messages.incoming.exchange';
    this.routingKey =
      process.env.RABBITMQ_ROUTING_KEY ||
      'direct.messages.incoming';
  }

  async send(message: BrokerMessage): Promise<void> {
    const connection = await amqp.connect(this.amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertExchange(this.exchangeName, 'direct', {
      durable: true,
    });
    channel.publish(
      this.exchangeName,
      this.routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true },
    );
    await channel.close();
    await connection.close();
  }
}
