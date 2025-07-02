import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AccountSignaturesService } from './account_signatures.service';
import { UpdateAccountSignatureDto } from './dto/update-account.dto';

@Controller('account-signatures')
export class AccountSignaturesController {
  constructor(private accountSignServies: AccountSignaturesService) {}

  @Get(':email')
  getSignature(@Param('email') email: string) {
    return this.accountSignServies.generateSignature(email);
  }

  @Patch(':email')
  updateAccount(
    @Param('email') email: string,
    @Body() updateInput: UpdateAccountSignatureDto,
  ) {
    return this.accountSignServies.upsert(email, updateInput);
  }
}
