import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthService } from 'src/auth/auth.service';
import { ConfigSchemaType } from 'src/common/config.schema';
import { EVENT_APPROVED_ASSORTMENT_KEY } from 'src/common/constant/event-key';
import { User } from 'src/users/entities/user.entity';
import { ZuluAssortmentsService } from 'src/zulu-assortments/zulu-assortments.service';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class SharePointService {
  private logger = new Logger(SharePointService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService<ConfigSchemaType>,
    private authService: AuthService,
    private zuluAssortmentsService: ZuluAssortmentsService,
    private zuluSalesOrdersService: ZuluSalesOrdersService,
  ) {}

  @OnEvent(EVENT_APPROVED_ASSORTMENT_KEY)
  async handleUploadImageEvent(payload: string) {
    try {
      const data = await this.handleParseData(payload);

      if (data) {
        await this.httpService.axiosRef.post(
          this.configService.get('AUTOMATE_PATH'),
          data,
          {},
        );
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async handleParseData(payload: string) {
    try {
      const assort = await this.zuluAssortmentsService.findOne(payload);

      const salesOrder = await this.zuluSalesOrdersService.findOneByOrderId(
        assort.orderId,
      );

      const output = `/${salesOrder.year}/7. Pack Center Images/${salesOrder.name}/${assort.customerItemNo} - ${assort.itemNo}`;

      const files = assort.pcfImages.map((pcfImage) => ({
        staticId: pcfImage.fileData.filename,
        filename: `${pcfImage._id.toString()}.${pcfImage.fileData.originalname.split('.').pop() ?? 'png'}`,
        location: '/images',
      }));

      return {
        output,
        host: this.configService.get('HOST_URL'),
        files,
      };
    } catch (error) {
      this.logger.error(this, error);
    }
  }

  async handleSendEmail(sendEmailDTO: SendEmailDto, user: User) {
    try {
      const token = await this.authService.signUser(user);
      const body = sendEmailDTO.body.replace(/(\r\n|\n|\r)/gm, '<br/>');

      const data = { ...sendEmailDTO, body, access_token: token };

      const response = await this.httpService.axiosRef.post(
        this.configService.get('SEND_EMAIL_URL'),
        data,
        {},
      );

      return { status: response.status };
    } catch (error) {
      this.logger.error(this, error);
      throw new InternalServerErrorException(error);
    }
  }
}
