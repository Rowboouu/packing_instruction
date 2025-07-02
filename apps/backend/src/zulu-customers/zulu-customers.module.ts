import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZuluApiModule } from 'src/zulu-api/zulu-api.module';
import {
  ZuluCustomer,
  ZuluCustomerSchema,
} from './entities/zulu-customer.entity';
import { ZuluCustomersController } from './zulu-customers.controller';
import { ZuluCustomersService } from './zulu-customers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ZuluCustomer.name, schema: ZuluCustomerSchema },
    ]),
    ZuluApiModule,
  ],
  controllers: [ZuluCustomersController],
  providers: [ZuluCustomersService],
  exports: [ZuluCustomersService],
})
export class ZuluCustomersModule {}
