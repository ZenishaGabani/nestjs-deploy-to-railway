import { Injectable } from '@nestjs/common';

@Injectable()
export class DevConfigService {
  getDBHOST(): string {
    return 'localhost';
  }
}
