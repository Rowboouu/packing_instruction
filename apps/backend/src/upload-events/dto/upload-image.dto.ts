import { IsNotEmpty, IsString } from 'class-validator';

export class EventUploadImageDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
