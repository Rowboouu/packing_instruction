import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';
import { SharePointService } from './share-point.service';

@Controller('share-point')
export class SharePointController {
  constructor(private sharePointService: SharePointService) {}

  @Post('email')
  @HttpCode(202)
  handleSendEmail(@Body() sendEmailDto: SendEmailDto, @Req() req) {
    return this.sharePointService.handleSendEmail(sendEmailDto, req.user);
  }
}
