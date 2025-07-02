import { PartialType } from '@nestjs/mapped-types';
import { CreateZuluAssortmentDto } from './create-zulu-assortment.dto';

export class UpdateZuluAssortmentDto extends PartialType(
  CreateZuluAssortmentDto,
) {}
