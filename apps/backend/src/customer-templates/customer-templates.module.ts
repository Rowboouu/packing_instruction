import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerTemplatesController } from './customer-templates.controller';
import { CustomerTemplatesService } from './customer-templates.service';
import {
  CustomerTemplate,
  CustomerTemplateSchema,
} from './entities/customer-template.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CustomerTemplate.name,
        schema: CustomerTemplateSchema,
      },
    ]),
  ],
  controllers: [CustomerTemplatesController],
  providers: [CustomerTemplatesService],
  exports: [CustomerTemplatesService],
})
export class CustomerTemplatesModule {}
