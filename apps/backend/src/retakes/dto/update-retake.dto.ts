import { PartialType } from '@nestjs/mapped-types';
import { CreateRetakeDto } from './create-retake.dto';

export class UpdateRetakeDto extends PartialType(CreateRetakeDto) {
  id: number;
}
