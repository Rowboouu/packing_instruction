import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ZuluApiModule } from 'src/zulu-api/zulu-api.module';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, ZuluApiModule],
  controllers: [HealthController],
})
export class HealthModule {}
