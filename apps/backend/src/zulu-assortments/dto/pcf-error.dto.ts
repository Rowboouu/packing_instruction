import { IsOptional, IsString } from 'class-validator';

export class PCFErrorDTO {
  @IsOptional()
  @IsString()
  masterUccErrors?: string;

  @IsOptional()
  @IsString()
  innerUccErrors?: string;
}
