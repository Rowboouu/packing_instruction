import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateZuluSalesOrderDto {
  @IsString()
  name: string;

  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsString()
  customerPoNo?: string;

  @IsNumber()
  partnerId: number;

  @IsOptional()
  @IsNumber({}, { each: true }) // Validate each element of the array as a number
  orderLines?: number[];

  @IsOptional()
  @IsString()
  etd?: string | null;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  state?: string;
}
