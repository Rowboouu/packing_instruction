import { Body, Controller, ForbiddenException, Patch } from '@nestjs/common';
import { UpdateItemDto } from './dto/update-item';
import { SeedersService } from './seeders.service';

@Controller('seeders')
export class SeedersController {
  constructor(private seedersService: SeedersService) {}

  @Patch()
  async updateItems(@Body() { key }: UpdateItemDto) {
    const validKey = 'G7J4K2L8D5F3X9M1Z0R6WQ';
    if (key !== validKey) {
      throw new ForbiddenException('Invalid key');
    }

    const [salesOrderResult, assortmentResult, imageResult] = await Promise.all(
      [
        this.seedersService.handleUpsertSaleOrder(),
        this.seedersService.handleUpsertAssortments(),
        this.seedersService.handleUpdateImages(),
      ],
    );

    return {
      salesOrderResult,
      assortmentResult,
      imageResult,
    };
  }
}
