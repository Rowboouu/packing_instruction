import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerTemplateDto } from './dto/create-customer-template.dto';
import { UpdateCustomerTemplateDto } from './dto/update-customer-template.dto';
import { CustomerTemplate } from './entities/customer-template.entity';

@Injectable()
export class CustomerTemplatesService {
  constructor(
    @InjectModel(CustomerTemplate.name)
    private customerTemplateModel: Model<CustomerTemplate>,
  ) {}

  async create(createCustomerTemplateDto: CreateCustomerTemplateDto) {
    try {
      const createdCustomerTemplate = new this.customerTemplateModel(
        createCustomerTemplateDto,
      );
      return await createdCustomerTemplate.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Customer already has a template');
      }
      throw new InternalServerErrorException(
        `Failed to create customer template : ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.customerTemplateModel
        .find()
        .collation({ locale: 'en_US', strength: 1 })
        .sort({ name: 1 })
        .populate({
          path: 'template',
          select: '-fileData',
        })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch customer templates: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const customerTemplate = await this.customerTemplateModel
        .findById(id)
        .populate({
          path: 'template',
        })
        .lean()
        .exec();
      if (!customerTemplate) {
        throw new NotFoundException(
          `Customer template with ID ${id} not found`,
        );
      }
      return customerTemplate;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to fetch customer template: ${error.message}`,
        )
      );
    }
  }

  async findOneByCustomerId(customerId: number) {
    return await this.customerTemplateModel
      .findOne({ customerIdL: customerId })
      .populate({
        path: 'template',
        populate: {
          path: 'fileData',
        },
      })
      .lean()
      .exec();
  }

  async update(
    id: string,
    updateCustomerTemplateDto: UpdateCustomerTemplateDto,
  ) {
    try {
      const updatedCustomerTemplate = await this.customerTemplateModel
        .findByIdAndUpdate(id, updateCustomerTemplateDto, { new: true })
        .exec();
      if (!updatedCustomerTemplate) {
        throw new NotFoundException(
          `Customer template with ID ${id} not found`,
        );
      }
      return updatedCustomerTemplate;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to update customer template: ${error.message}`,
        )
      );
    }
  }

  async remove(id: string) {
    try {
      const deletedCustomerTemplate = await this.customerTemplateModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedCustomerTemplate) {
        throw new NotFoundException(
          `Customer template with ID ${id} not found`,
        );
      }
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to remove customer template: ${error.message}`,
        )
      );
    }
  }
}
