import { Inject, Injectable } from '@nestjs/common';
import { DevConfigService } from './common/constants/providers/DevConfigService';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private devConfigService: DevConfigService,
    private configService: ConfigService,
    @Inject('CONFIG') private config: { port: number },
  ) {
    console.log('Loaded CONFIG:', config);
  }

  getHello(): string {
    return `Hello I am  learning Nest.js Fundamentals ${this.devConfigService.getDBHOST()} PORT = ${this.config.port}`;
  }
}
