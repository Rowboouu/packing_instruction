import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { configOptions } from './config/config';
import { loggerParams } from './config/logger.config';
import { mongooseOptions } from './config/mongoose.config';
import { CustomerTemplatesModule } from './customer-templates/customer-templates.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './files/files.module';
import { GroupsModule } from './groups/groups.module';
import { HealthController } from './health/health.controller';
import { HealthModule } from './health/health.module';
import { PcfImagesModule } from './pcf-images/pcf-images.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ReportsModule } from './reports/reports.module';
import { RetakesModule } from './retakes/retakes.module';
import { SeedersModule } from './seeders/seeders.module';
import { SharePointModule } from './share-point/share-point.module';
import { TasksModule } from './tasks/tasks.module';
import { TemplatesModule } from './templates/templates.module';
import { TranslationsModule } from './translations/translations.module';
import { UploadEventsModule } from './upload-events/upload-events.module';
import { UsersModule } from './users/users.module';
import { ZuluApiModule } from './zulu-api/zulu-api.module';
import { ZuluAssortmentsModule } from './zulu-assortments/zulu-assortments.module';
import { ZuluCustomersModule } from './zulu-customers/zulu-customers.module';
import { ZuluSalesOrdersModule } from './zulu-sales-orders/zulu-sales-orders.module';
import { AccountSignaturesModule } from './account_signatures/account_signatures.module';
import { ClusterModule } from './cluster/cluster.module';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    MongooseModule.forRootAsync(mongooseOptions),
    LoggerModule.forRootAsync(loggerParams),
    MulterModule.register({
      dest: './upload',
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    TerminusModule,
    UsersModule,
    AuthModule,
    GroupsModule,
    PermissionsModule,
    FilesModule,
    TemplatesModule,
    EventsModule,
    CustomerTemplatesModule,
    TasksModule,
    ZuluApiModule,
    ZuluSalesOrdersModule,
    HealthModule,
    ZuluAssortmentsModule,
    ZuluCustomersModule,
    PcfImagesModule,
    ReportsModule,
    SeedersModule,
    RetakesModule,
    TranslationsModule,
    UploadEventsModule,
    SharePointModule,
    AccountSignaturesModule,
    ClusterModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
