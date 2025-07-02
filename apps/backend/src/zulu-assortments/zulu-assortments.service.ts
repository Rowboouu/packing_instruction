import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  EVENT_APPROVED_ASSORTMENT_KEY,
  EVENT_UPLOAD_IMAGE_KEY,
} from 'src/common/constant/event-key';
import { PcfImagesService } from 'src/pcf-images/pcf-images.service';
import { EventUploadImageDto } from 'src/upload-events/dto/upload-image.dto';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';
import { CreateZuluAssortmentDto } from './dto/create-zulu-assortment.dto';
import { PCFErrorDTO } from './dto/pcf-error.dto';
import { UpdateZuluAssortmentDto } from './dto/update-zulu-assortment.dto';
import {
  ZuluAssortment,
  ZuluAssortmentDocument,
} from './entities/zulu-assortment.entity';
import { FileObject, imageUploadField } from './uploadObject';

@Injectable()
export class ZuluAssortmentsService {
  constructor(
    @InjectModel(ZuluAssortment.name)
    private zuluOrderItemModel: Model<ZuluAssortment>,
    private pcfImagesService: PcfImagesService,
    private zuluSalesOrdersService: ZuluSalesOrdersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createZuluAssortmentDto: CreateZuluAssortmentDto,
  ): Promise<ZuluAssortment> {
    try {
      const createdZuluAssortment = new this.zuluOrderItemModel(
        createZuluAssortmentDto,
      );
      return await createdZuluAssortment.save();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create ZuluAssortment',
        error.message,
      );
    }
  }

  async findAllPaginated(
    page: number,
    limit: number,
    keyword?: string,
    status?: string,
    orderId?: string,
  ) {
    try {
      const skip = (page - 1) * limit;
      const filter: FilterQuery<ZuluAssortment> = {
        customerItemNo: { $ne: null },
      };

      if (keyword) {
        filter.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { customerItemNo: { $regex: keyword, $options: 'i' } },
          { itemNo: { $regex: keyword, $options: 'i' } },
        ];
      }

      if (orderId) {
        filter.orderId = Number(orderId);
      }

      const countFilter = { ...filter };
      if (status) {
        filter.status = status;
        delete countFilter.status;
      }

      const [items, totalItems, statuses] = await Promise.all([
        this.zuluOrderItemModel
          .find(filter)
          .collation({ locale: 'en_US', strength: 1 })
          .sort({ customerItemNo: 1, itemNo: 1 })
          .populate({
            path: 'image',
            select: '-path -destination',
          })
          .select('-pcfImages')
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.zuluOrderItemModel.countDocuments(filter),
        this.zuluOrderItemModel.aggregate([
          { $match: countFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

      const statusCount = statuses.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        acc['all'] = (acc['all'] || 0) + count;
        return acc;
      }, {});

      const nextPage = totalItems > skip + limit ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      const totalPages = Math.ceil(totalItems / limit);

      return {
        items,
        totalItems,
        nextPage,
        prevPage,
        totalPages,
        page,
        limit,
        statusCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create ZuluSalesOrder',
        error.message,
      );
    }
  }

  async findAll(
    options: FilterQuery<ZuluAssortmentDocument> = {},
  ): Promise<Partial<ZuluAssortmentDocument>[]> {
    try {
      return await this.zuluOrderItemModel
        .find(options)
        .collation({ locale: 'en_US', strength: 1 })
        .sort({ customerItemNo: 1, itemNo: 1 })
        .populate({
          path: 'image',
          select: '-buffer -pcfImages',
        })
        .select('-pcfImages')
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch ZuluAssortments',
        error.message,
      );
    }
  }

  async bulkUpsert(
    items: CreateZuluAssortmentDto[],
  ): Promise<{ upsertedIds: Record<string, Types.UUID> }> {
    try {
      const bulkOperations = items.map(({ orderItemId, ...data }) => {
        return {
          updateOne: {
            filter: { orderItemId: orderItemId },
            update: { $set: data },
            upsert: true,
          },
        };
      });

      return this.zuluOrderItemModel.bulkWrite(bulkOperations);
    } catch (error) {
      console.log(error.writeErrors);
      throw new InternalServerErrorException(
        'Failed to bulk upsert ZuluAssortments',
        error.message,
      );
    }
  }

  async customBulkUpsert(
    items: Array<{ _id: any; [key: string]: any }>,
  ): Promise<any> {
    try {
      const bulkOperations = items.map(({ _id, ...data }) => {
        return {
          updateOne: {
            filter: { _id: _id },
            update: { $set: data },
            upsert: true,
          },
        };
      });

      return this.zuluOrderItemModel.bulkWrite(bulkOperations);
    } catch (error) {
      console.log(error.writeErrors);
      throw new InternalServerErrorException(
        'Failed to bulk upsert ZuluAssortments',
        error.message,
      );
    }
  }

  async findOne(id: string): Promise<ZuluAssortment> {
    try {
      const zuluOrderItem = await this.zuluOrderItemModel
        .findById(id)
        .populate([
          { path: 'image' },
          {
            path: 'pcfImages',
            populate: { path: 'fileData' },
          },
        ])
        .lean()
        .exec();
      if (!zuluOrderItem) {
        throw new NotFoundException(`ZuluAssortment with ID ${id} not found`);
      }
      return zuluOrderItem;
    } catch (error) {
      // Handle specific error types if needed
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch ZuluAssortment',
        error.message,
      );
    }
  }

  async update(
    id: string,
    updateZuluAssortmentDto: UpdateZuluAssortmentDto,
  ): Promise<ZuluAssortment> {
    try {
      const updatedZuluAssortment = await this.zuluOrderItemModel
        .findByIdAndUpdate(id, updateZuluAssortmentDto, { new: true })
        .exec();
      if (!updatedZuluAssortment) {
        throw new NotFoundException(`ZuluAssortment with ID ${id} not found`);
      }

      if (updateZuluAssortmentDto.status === 'approved') {
        this.eventEmitter.emit(EVENT_APPROVED_ASSORTMENT_KEY, id);
      }

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update ZuluAssortment',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.zuluOrderItemModel
        .deleteOne({ _id: id })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`ZuluAssortment with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove ZuluAssortment',
        error.message,
      );
    }
  }

  async updateImages(
    id: string,
    fileObject: FileObject,
    pcfErrors: PCFErrorDTO,
    userId?: string,
  ) {
    try {
      const files = Object.values(fileObject).flat();
      const assortment = await this.findOne(id);

      if (!assortment) {
        throw new NotFoundException(`ZuluAssortment with ID ${id} not found`);
      }

      if (files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      const uniqueFields = files
        .filter((file) => {
          return imageUploadField.some(
            (field) => field.maxCount && field.name === file.fieldname,
          );
        })
        .map((file) => file.fieldname);

      const images = assortment?.pcfImages || [];
      const oldImages = images
        .filter((pcfImage) => !uniqueFields.includes(pcfImage.field))
        .map((item) => item._id);

      const newImages = await this.pcfImagesService.createFromFiles(id, files);

      await this.zuluOrderItemModel
        .findByIdAndUpdate(
          id,
          {
            $set: {
              status: 'ongoing',
              pcfImages: [...oldImages, ...newImages],
            },
          },
          { new: true },
        )
        .exec();

      await this.zuluSalesOrdersService.updateStatusByOrderId(
        assortment.orderId,
        [],
        'ongoing',
      );

      const item = await this.findOne(id);
      const fieldNames = new Set(item.pcfImages.map((item) => item.field));
      const isComplete = imageUploadField.every((field) =>
        fieldNames.has(field.name),
      );

      if (pcfErrors.masterUccErrors) {
        const masterUccLabel = item.pcfImages.find(
          (image) => image.field === 'masterUccLabel',
        );
        if (masterUccLabel) {
          await this.pcfImagesService.update(
            masterUccLabel._id.toString(),
            {
              barcodeErrors: pcfErrors.masterUccErrors.split(','),
            },
            userId,
          );
        }
      }

      if (pcfErrors.innerUccErrors) {
        const innerUccLabel = item.pcfImages.find(
          (image) => image.field === 'innerUccLabel',
        );
        if (innerUccLabel) {
          await this.pcfImagesService.update(
            innerUccLabel._id.toString(),
            {
              barcodeErrors: pcfErrors.innerUccErrors.split(','),
            },
            userId,
          );
        }
      }

      if (isComplete) {
        await this.zuluOrderItemModel
          .findByIdAndUpdate(
            id,
            { $set: { status: 'completed' } },
            { new: true },
          )
          .exec();
        item.status = 'completed';
      }

      if (userId) {
        const uploadImage = new EventUploadImageDto();
        uploadImage.itemId = id;
        uploadImage.createdBy = userId;
        this.eventEmitter.emit(EVENT_UPLOAD_IMAGE_KEY, uploadImage);
      }

      return item;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update ZuluAssortment',
        error.message,
      );
    }
  }
}
