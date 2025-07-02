import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountSignatureDto } from './create-account.dto';

export class UpdateAccountSignatureDto extends PartialType(
  CreateAccountSignatureDto,
) {}
