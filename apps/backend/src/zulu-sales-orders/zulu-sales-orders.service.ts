import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getYear, isValid } from 'date-fns';
import { Model, Types } from 'mongoose';
import { CreateZuluSalesOrderDto } from './dto/create-zulu-sales-order.dto';
import { UpdateZuluSalesOrderDto } from './dto/update-zulu-sales-order.dto';
import { ZuluSalesOrder } from './entities/zulu-sales-order.entity';

@Injectable()
export class ZuluSalesOrdersService {
  constructor(
    @InjectModel(ZuluSalesOrder.name)
    private zuluSalesOrderModel: Model<ZuluSalesOrder>,
  ) {}

  async create(
    createZuluSalesOrderDto: CreateZuluSalesOrderDto,
  ): Promise<ZuluSalesOrder> {
    try {
      const createdZuluSalesOrder = new this.zuluSalesOrderModel(
        createZuluSalesOrderDto,
      );
      return await createdZuluSalesOrder.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async bulkUpsert(
    createZuluSalesOrderDto: CreateZuluSalesOrderDto[],
  ): Promise<any> {
    try {
      const bulkOperations = createZuluSalesOrderDto.map(
        ({ orderId, ...data }) => ({
          updateOne: {
            filter: { orderId: orderId },
            update: { $set: data },
            upsert: true,
          },
        }),
      );

      return this.zuluSalesOrderModel.bulkWrite(bulkOperations);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to bulk write ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findAllPaginated(page: number, limit: number, keyword?: string) {
    try {
      const skip = (page - 1) * limit;
      const filter: any = { state: 'sale' };

      if (keyword) {
        filter.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { customerPoNo: { $regex: keyword, $options: 'i' } },
        ];
      }

      const [items, totalItems] = await Promise.all([
        this.zuluSalesOrderModel
          .find(filter)
          .collation({ locale: 'en_US', strength: 1 })
          .sort({ name: 1 })
          .select({
            state: 0,
          })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.zuluSalesOrderModel.countDocuments(filter),
      ]);

      const nextPage = totalItems > skip + limit ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      const totalPages = Math.ceil(totalItems / limit);

      return { items, totalItems, nextPage, prevPage, totalPages, page, limit };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findAll() {
    try {
      const items = await this.zuluSalesOrderModel
        .find({ state: 'sale' })
        .collation({ locale: 'en_US', strength: 1 })
        .sort({ name: 1 })
        .select({
          state: 0,
        })
        .lean()
        .exec();

      return items;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findAllByCustomerIds(customerIds: number[]) {
    try {
      const aggregatedItems = await this.zuluSalesOrderModel
        .aggregate([
          {
            $match: {
              partnerId: {
                $in: customerIds,
              },
              state: 'sale',
            },
          },
          {
            $lookup: {
              from: 'zuluassortments', // The name of the assortment collection
              localField: 'orderId',
              foreignField: 'orderId',
              as: 'assortments',
            },
          },
          {
            $unwind: {
              path: '$assortments',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: '$_id',
              order: { $first: '$$ROOT' },
              orderItems: {
                $push: {
                  $cond: [
                    {
                      $eq: ['$assortments.status', 'approved'],
                    }, // Check if the status is 'approved'
                    '$assortments._id', // If approved, add the assortment ID to orderItems
                    '$$REMOVE', // Otherwise, remove the field from the array
                  ],
                },
              },
            },
          },
          {
            $unset: 'order.assortments', // Remove the 'assortments' field from the 'order' object
          },
          {
            $project: {
              _id: 0, // Exclude _id field
              orderId: '$_id',
              order: {
                $mergeObjects: [
                  '$order',
                  {
                    orderItems: {
                      $ifNull: ['$orderItems', []],
                    },
                  },
                ],
              },
            },
          },
        ])
        .exec();

      const dataItems = aggregatedItems.map((item) => {
        return item.order;
      });

      return dataItems;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findOne(id: string): Promise<ZuluSalesOrder> {
    try {
      const zuluSalesOrder = await this.zuluSalesOrderModel
        .findById(id)
        .select({
          state: 0,
        })
        .lean()
        .exec();
      if (!zuluSalesOrder) {
        throw new NotFoundException(`ZuluSalesOrder with ID ${id} not found`);
      }
      return zuluSalesOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findOneByOrderId(
    id: number,
  ): Promise<ZuluSalesOrder & { year: string }> {
    try {
      const zuluSalesOrder = await this.zuluSalesOrderModel
        .findOne({ orderId: id })
        .select({
          state: 0,
        })
        .lean()
        .exec();
      if (!zuluSalesOrder) {
        throw new NotFoundException(
          `ZuluSalesOrder with Order Id ${id} not found`,
        );
      }
      const digits = zuluSalesOrder.name.replace(/\D/g, '');
      let year = '20' + digits.substring(0, 2);

      // Check if year is valid
      if (!isValid(new Date(Number(year), 0))) {
        year = getYear(new Date()).toString();
      }

      return { ...zuluSalesOrder, year };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async update(
    id: string,
    updateZuluSalesOrderDto: UpdateZuluSalesOrderDto,
  ): Promise<ZuluSalesOrder> {
    try {
      const updatedZuluSalesOrder = await this.zuluSalesOrderModel
        .findByIdAndUpdate(id, updateZuluSalesOrderDto, { new: true })
        .exec();
      if (!updatedZuluSalesOrder) {
        throw new NotFoundException(`ZuluSalesOrder with ID ${id} not found`);
      }
      return updatedZuluSalesOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async updateStatusByOrderId(
    orderId: number,
    orderItems: Types.ObjectId[],
    status?: 'todo' | 'ongoing' | 'completed',
  ): Promise<any> {
    try {
      const updateQuery: any = {
        $addToSet: { orderItems: { $each: orderItems } },
      };

      if (status !== undefined) {
        updateQuery.$set = { status };
      }

      const updatedZuluSalesOrder = await this.zuluSalesOrderModel
        .findOneAndUpdate({ orderId }, updateQuery, { new: true })
        .exec();
      if (!updatedZuluSalesOrder) {
        throw new NotFoundException(
          `ZuluSalesOrder with Order II ${orderId} not found`,
        );
      }
      return updatedZuluSalesOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.zuluSalesOrderModel
        .deleteOne({ _id: id })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`ZuluSalesOrder with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }
}
