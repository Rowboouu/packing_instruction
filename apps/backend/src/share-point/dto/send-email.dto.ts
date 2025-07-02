import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

class Item {
  @IsString()
  item_name: string;

  @IsString()
  item_id: string;

  constructor(item_name: string, item_id: string) {
    this.item_id = item_id;
    this.item_name = item_name;
  }
}

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsEmail()
  from: string;

  @IsOptional()
  @IsString()
  cc: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsArray()
  @Type(() => Item)
  items: Item[];
}
