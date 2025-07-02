import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerTemplateDto } from './create-customer-template.dto';

export class UpdateCustomerTemplateDto extends PartialType(
  CreateCustomerTemplateDto,
) {}
