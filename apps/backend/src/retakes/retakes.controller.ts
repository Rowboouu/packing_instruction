import { Controller, Get, Query } from '@nestjs/common';
import { QueryParamsDto } from 'src/common/pagination/pagination-query.dto';
import { RetakesService } from './retakes.service';

@Controller('retakes')
export class RetakesController {
  constructor(private readonly retakesService: RetakesService) {}

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.retakesService.findAll(
      query.page,
      query.limit,
      undefined,
      query.isDone,
    );
  }
}
