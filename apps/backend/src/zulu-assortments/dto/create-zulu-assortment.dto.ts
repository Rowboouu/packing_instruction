import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Label } from 'src/zulu-api/zulu-types';

export class CreateZuluAssortmentDto {
  @IsString()
  name: string;

  @IsNumber()
  orderItemId: number;

  @IsString()
  itemNo: string;

  @IsOptional()
  @IsString()
  customerItemNo?: string;

  @IsNumber()
  productId: number;

  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumber()
  @IsOptional()
  productInCarton: number = 0;

  @IsNumber()
  @IsOptional()
  productPerUnit: number = 0;

  @IsString()
  @IsOptional()
  masterCUFT?: string;

  @IsString()
  @IsOptional()
  masterGrossWeight?: string;

  @IsString({ each: true })
  labels: Label[];
}
