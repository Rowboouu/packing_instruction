import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateZuluCustomerDto } from './dto/create-zulu-customer.dto';
import { ZuluCustomer } from './entities/zulu-customer.entity';

@Injectable()
export class ZuluCustomersService {
  constructor(
    @InjectModel(ZuluCustomer.name)
    private zuluCustomerModel: Model<ZuluCustomer>,
  ) {}

  create(createZuluCustomerDto: CreateZuluCustomerDto) {
    return this.zuluCustomerModel
      .findOneAndUpdate(
        { partnerId: createZuluCustomerDto.partnerId },
        createZuluCustomerDto,
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();
  }

  findOne(id: number): Promise<ZuluCustomer | null> {
    return this.zuluCustomerModel.findOne({ partnerId: id }).exec();
  }
}
