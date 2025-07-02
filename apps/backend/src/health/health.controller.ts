import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/common/decorators/public.decorator';
import { ZuluApiHealthIndicator } from 'src/zulu-api/zulu-api.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private zuluApi: ZuluApiHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.zuluApi.apiHealthCheck(),
      () => this.zuluApi.soHealthCheck(),
      () => this.zuluApi.assortHealthCheck(),
      () => this.zuluApi.custHealthCheck(),
    ]);
  }
}
