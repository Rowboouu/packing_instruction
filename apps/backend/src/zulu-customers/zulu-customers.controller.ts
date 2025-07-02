import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryParamsDto } from 'src/common/pagination/pagination-query.dto';
import { ZuluApiService } from 'src/zulu-api/zulu-api.service';
import { ZuluCustomersService } from './zulu-customers.service';

@Controller('zulu-customers')
export class ZuluCustomersController {
  constructor(
    private readonly zuluCustomersService: ZuluCustomersService,
    private readonly zuluApiService: ZuluApiService,
  ) {}

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.zuluApiService.getCustomers(
      query.keyword,
      query.per_page,
      query.page,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const partner = await this.zuluCustomersService.findOne(+id);

    if (!partner) {
      const zuluPartner = await this.zuluApiService.getPartner(+id);
      if (zuluPartner.length > 0) {
        return this.zuluCustomersService.create({
          partnerId: zuluPartner[0].id,
          name: zuluPartner[0].name,
        });
      }
    }

    return partner;
  }
}
