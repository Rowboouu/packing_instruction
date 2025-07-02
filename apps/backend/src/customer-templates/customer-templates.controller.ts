import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CustomerTemplatesService } from './customer-templates.service';
import { CreateCustomerTemplateDto } from './dto/create-customer-template.dto';
import { UpdateCustomerTemplateDto } from './dto/update-customer-template.dto';

@Controller('customer-templates')
export class CustomerTemplatesController {
  constructor(
    private readonly customerTemplatesService: CustomerTemplatesService,
  ) {}

  @Post()
  create(@Body() createCustomerTemplateDto: CreateCustomerTemplateDto) {
    return this.customerTemplatesService.create(createCustomerTemplateDto);
  }

  @Get()
  findAll() {
    return this.customerTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerTemplateDto: UpdateCustomerTemplateDto,
  ) {
    return this.customerTemplatesService.update(id, updateCustomerTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerTemplatesService.remove(id);
  }
}
