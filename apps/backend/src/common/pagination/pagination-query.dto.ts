import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @Type(() => String)
  @IsString()
  readonly keyword?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly page: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly limit: number;

  @IsOptional() // Add these lines
  @Type(() => String)
  @IsString()
  readonly status?: string;

  @IsOptional() // Add these lines
  @Type(() => String)
  @IsString()
  readonly orderId?: string;

  readonly [key: string]: any;

  constructor(partial: Partial<QueryParamsDto>) {
    Object.assign(this, partial);
    this.page = this.page || 1;
    this.limit = this.limit || 10;
  }
}
