import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SeedersService } from 'src/seeders/seeders.service';
import { ZuluApiService } from 'src/zulu-api/zulu-api.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private zuluApiService: ZuluApiService,
    private seedersService: SeedersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCheckHealth() {
    const res = await this.zuluApiService.checkHealth();
    this.logger.debug(`ZULU health check every midnight: ${res.message}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleUpsertSaleOrder() {
    this.logger.log('###### Initializing sales order update from zulu ######');
    const result = await this.seedersService.handleUpsertSaleOrder();

    console.log(result);
    this.logger.log('##### sales order update from zulu done #####');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleUpsertAssortments() {
    this.logger.log('###### Initializing Assortment update from zulu ######');

    const assResult = await this.seedersService.handleUpsertAssortments();
    console.log(assResult);
    this.logger.log('##### assortment update from zulu done #####');

    this.logger.log(
      '###### Initializing Assortment update with no Image ######',
    );
    const imgResult = await this.seedersService.handleUpdateImages();
    console.log(imgResult);
    this.logger.log(`###### Updating assortment with no Image ######`);
  }

  // TODO add cron here for updating sales order status from zulu
}
