import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ejs from 'ejs';
import * as fs from 'fs';
import { Model } from 'mongoose';
import * as path from 'path';
import { CreateAccountSignatureDto } from './dto/create-account.dto';
import { UpdateAccountSignatureDto } from './dto/update-account.dto';
import {
  AccountSignature,
  AccountSignatureDocument,
} from './entities/account_signature';

@Injectable()
export class AccountSignaturesService {
  private logger = new Logger(AccountSignaturesService.name);
  private defaultAccount = {
    email: 'riza@1000miles.biz',
    name: 'Riza',
    position: 'Production Assistant',
    ext: '819',
    skype: 'riza@1000m.xyz',
  };

  constructor(
    @InjectModel(AccountSignature.name)
    private accountSignatureModel: Model<AccountSignatureDocument>,
  ) {}

  async generateSignature(email: string) {
    try {
      const account = await this.findOneByEmail(email);

      const template = fs.readFileSync(
        path.join(process.cwd(), '/public/html/signature.ejs'),
        'utf-8',
      );

      return ejs.render(template, account);
    } catch (err) {
      this.logger.error(err.message);
      throw new InternalServerErrorException('Error generating signature');
    }
  }

  async findOneByEmail(email: string) {
    try {
      const accountSign = await this.accountSignatureModel
        .findOne({ email: new RegExp(`^${email}$`, 'i') })
        .lean()
        .exec();
      if (!accountSign) {
        const defaultAccount = this.defaultAccount;
        defaultAccount.email = email;
        defaultAccount.skype = email;
        defaultAccount.name =
          email.split('@')[0].charAt(0).toUpperCase() +
          email.split('@')[0].slice(1);

        return defaultAccount;
      }

      return accountSign;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createInput: CreateAccountSignatureDto) {
    try {
      const createdAccount = new this.accountSignatureModel(createInput);

      const account = await createdAccount.save();
      return account;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new ConflictException(
          `Email ${createInput.email} already has account`,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async upsert(email: string, updateInput: UpdateAccountSignatureDto) {
    try {
      const filter = { email };
      const update = { email, ...updateInput };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      return await this.accountSignatureModel.findOneAndUpdate(
        filter,
        update,
        options,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async updateById(id: string, updateInput: UpdateAccountSignatureDto) {
    try {
      const updatedAccount = await this.accountSignatureModel.findByIdAndUpdate(
        id,
        updateInput,
        { new: true },
      );

      if (!updatedAccount) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }

      return updatedAccount;
    } catch (error) {
      if (error.code === 11000) {
        // MongoDB duplicate key error code
        throw new ConflictException(
          `Email ${updateInput.email} already has account`,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
