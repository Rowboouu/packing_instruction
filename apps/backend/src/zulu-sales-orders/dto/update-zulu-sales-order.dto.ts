import { PartialType } from '@nestjs/mapped-types';
import { CreateZuluSalesOrderDto } from './create-zulu-sales-order.dto';

export class UpdateZuluSalesOrderDto extends PartialType(
  CreateZuluSalesOrderDto,
) {}
