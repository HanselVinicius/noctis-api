import dotenv from 'dotenv'
dotenv.config({
  path: '.env'
});

import tracer from './tracer';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    await tracer.start();

    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableCors();

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`Application running on: http://localhost:${port}/api`);
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();
