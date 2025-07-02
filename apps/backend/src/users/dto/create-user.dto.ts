import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 255, { message: 'Please input a name' })
  name: string;

  @IsString()
  @Length(8, 100, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  role: string;

  @IsString()
  permission: string;

  @IsString()
  language?: string;
}
