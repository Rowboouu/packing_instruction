import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZuluSalesOrdersModule } from 'src/zulu-sales-orders/zulu-sales-orders.module';
import { Group, GroupSchema } from './entities/group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    ZuluSalesOrdersModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
