import { PartialType } from '@nestjs/mapped-types';
import { CreateZuluCustomerDto } from './create-zulu-customer.dto';

export class UpdateZuluCustomerDto extends PartialType(CreateZuluCustomerDto) {}
