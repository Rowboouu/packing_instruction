import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    private zuluSalesOrderService: ZuluSalesOrdersService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const createdGroup = new this.groupModel(createGroupDto);
      return await createdGroup.save();
    } catch (error) {
      // Handle error
      throw new InternalServerErrorException(
        `Failed to create group: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      return await this.groupModel
        .find()
        .collation({ locale: 'en_US', strength: 1 })
        .sort({ name: 1 })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch groups: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const group = await this.groupModel.findById(id).lean().exec();

      if (!group) {
        throw new NotFoundException(`Group with id ${id} not found`);
      }

      const customerIds = group?.customers.map((customer) => customer.id);
      const salesOrders =
        await this.zuluSalesOrderService.findAllByCustomerIds(customerIds);

      return { ...group, salesOrders };
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to find group: ${error.message}`,
        )
      );
    }
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const updatedGroup = await this.groupModel
        .findByIdAndUpdate(id, updateGroupDto, { new: true })
        .exec();
      if (!updatedGroup) {
        throw new NotFoundException(`Group with id ${id} not found`);
      }
      return updatedGroup;
    } catch (error) {
      // Handle error
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to update group: ${error.message}`,
        )
      );
    }
  }

  async remove(id: string) {
    try {
      const deletedGroup = await this.groupModel.findByIdAndDelete(id).exec();
      if (!deletedGroup) {
        throw new NotFoundException(`Group with id ${id} not found`);
      }
      return deletedGroup;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to remove group: ${error.message}`,
        )
      );
    }
  }
}
