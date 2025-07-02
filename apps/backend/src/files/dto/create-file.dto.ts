import { IsMimeType, IsNotEmpty, IsString } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  originalname: string;

  @IsNotEmpty()
  @IsString()
  encoding: string;

  @IsNotEmpty()
  @IsMimeType()
  mimetype: string;

  @IsNotEmpty()
  buffer: Buffer;

  @IsNotEmpty()
  size: number;
}
