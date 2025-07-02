import { PartialType } from '@nestjs/mapped-types';
import { FileData } from 'src/files/entities/file.entity';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}

export class UpdateTemplateWithFileDto extends UpdateTemplateDto {
  fileData?: FileData;
}
