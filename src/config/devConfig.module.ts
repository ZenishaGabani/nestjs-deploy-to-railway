import { Module } from '@nestjs/common';
import { DevConfigService } from '../common/constants/providers/DevConfigService';

@Module({
  providers: [DevConfigService],
  exports: [DevConfigService],
})
export class DevConfigModule {}
