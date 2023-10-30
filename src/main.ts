import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { AppModule } from './app.module';
import { EmailSenderModule } from './email-sender/email-sender.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
  });

  const port = process.env.PORT || 3000;

  app.enableCors();
  
  app.select(EmailSenderModule);

  await app.listen(port);
}
bootstrap();