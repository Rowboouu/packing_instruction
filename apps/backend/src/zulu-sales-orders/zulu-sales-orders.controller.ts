import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QueryParamsDto } from 'src/common/pagination/pagination-query.dto';
import { CreateZuluSalesOrderDto } from './dto/create-zulu-sales-order.dto';
import { UpdateZuluSalesOrderDto } from './dto/update-zulu-sales-order.dto';
import { ZuluSalesOrdersService } from './zulu-sales-orders.service';

@Controller('zulu-sales-orders')
export class ZuluSalesOrdersController {
  constructor(
    private readonly zuluSalesOrdersService: ZuluSalesOrdersService,
  ) {}

  @Post()
  create(@Body() createZuluSalesOrderDto: CreateZuluSalesOrderDto) {
    return this.zuluSalesOrdersService.create(createZuluSalesOrderDto);
  }

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.zuluSalesOrdersService.findAllPaginated(
      query.page,
      query.limit,
      query.keyword,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zuluSalesOrdersService.findOne(id);
  }

  @Get('order-id/:orderId')
  findOneByOrderId(@Param('orderId') orderId: number) {
    return this.zuluSalesOrdersService.findOneByOrderId(orderId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateZuluSalesOrderDto: UpdateZuluSalesOrderDto,
  ) {
    return this.zuluSalesOrdersService.update(id, updateZuluSalesOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zuluSalesOrdersService.remove(id);
  }
}
