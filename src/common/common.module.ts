import { Module } from '@nestjs/common';
import { connection } from './constants/connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
  exports: ['CONNECTION'],
})
export class CommonModule {}
