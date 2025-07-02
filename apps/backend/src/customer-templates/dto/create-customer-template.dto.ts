import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCustomerTemplateDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  template: string;
}
