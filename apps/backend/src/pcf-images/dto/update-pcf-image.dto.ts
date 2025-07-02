import { PartialType } from '@nestjs/mapped-types';
import { CreatePcfImageDto } from './create-pcf-image.dto';

export class UpdatePcfImageDto extends PartialType(CreatePcfImageDto) {}
