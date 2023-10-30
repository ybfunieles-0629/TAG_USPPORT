import { Module } from '@nestjs/common';

import emailSenderConfig from './email-sender.config';

@Module({
  providers: [
    {
      provide: 'EMAIL_CONFIG',
      useValue: emailSenderConfig,
    },
  ],
  exports: ['EMAIL_CONFIG'],
})
export class EmailSenderModule { }