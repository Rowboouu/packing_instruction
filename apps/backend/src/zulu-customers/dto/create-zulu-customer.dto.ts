import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateZuluCustomerDto {
  @IsNumber()
  @IsNotEmpty()
  partnerId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
