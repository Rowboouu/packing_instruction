import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSignaturesController } from './account_signatures.controller';
import { AccountSignaturesService } from './account_signatures.service';
import {
  AccountSignature,
  AccountSignatureSchema,
} from './entities/account_signature';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountSignature.name, schema: AccountSignatureSchema },
    ]),
  ],
  controllers: [AccountSignaturesController],
  providers: [AccountSignaturesService],
})
export class AccountSignaturesModule {}
