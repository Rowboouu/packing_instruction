import { Injectable } from '@nestjs/common';
import { HealthIndicator } from '@nestjs/terminus';
import { ZuluApiService } from './zulu-api.service';

@Injectable()
export class ZuluApiHealthIndicator extends HealthIndicator {
  constructor(private readonly zuluApiService: ZuluApiService) {
    super();
  }

  async apiHealthCheck() {
    const key = 'api-health-check';
    try {
      await this.zuluApiService.checkHealth();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }

  async soHealthCheck() {
    const key = 'api-sales-order';
    try {
      await this.zuluApiService.getSalesOrders();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }

  async assortHealthCheck() {
    const key = 'api-assortments';
    try {
      await this.zuluApiService.getAssortments();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }

  async custHealthCheck() {
    const key = 'api-customers';
    try {
      await this.zuluApiService.getCustomers();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}
