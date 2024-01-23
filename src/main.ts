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

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir múltiples orígenes de desarrollo y producción
      const allowedOrigins = [
        'http://localhost:4200',
        'https://tu-dominio-produccion.com', // Reemplaza con tu dominio de producción
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido'));
      }
    },
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
      'Content-Length', // Añadido para cubrir más escenarios
    ],
    exposedHeaders: ['Authorization'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permitir todos los métodos HTTP
    preflightContinue: false, // Evitar solicitudes preflight innecesarias
    maxAge: 600, // Cachear la respuesta CORS por 10 minutos
  });

  app.select(EmailSenderModule);

  await app.listen(port);
}
bootstrap();