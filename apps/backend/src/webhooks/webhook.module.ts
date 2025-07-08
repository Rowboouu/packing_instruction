import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookData, WebhookDataSchema } from './schemas/webhook-data.schema';
import { IndividualAssortment, IndividualAssortmentSchema } from './schemas/individual-assortment.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookData.name, schema: WebhookDataSchema },
      { name: IndividualAssortment.name, schema: IndividualAssortmentSchema },
    ])
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService], // Export service in case other modules need it
})
export class WebhookModule {}