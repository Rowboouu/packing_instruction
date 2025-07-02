import { IsString, Length } from 'class-validator';

export class UpdateItemDto {
  @IsString()
  @Length(1, 255, { message: 'Please input a key' })
  key: string;
}
