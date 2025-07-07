import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookController } from './controllers/webhook.controller';
import { WebhookService } from './services/webhook.service';
import { WebhookData, WebhookDataSchema } from './schemas/webhook-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookData.name, schema: WebhookDataSchema }
    ])
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService], // Export service in case other modules need it
})
export class WebhookModule {}