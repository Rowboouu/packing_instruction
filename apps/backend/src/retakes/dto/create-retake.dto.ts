import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRetakeDto {
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;
}
