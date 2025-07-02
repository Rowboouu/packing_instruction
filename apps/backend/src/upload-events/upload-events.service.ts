import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { EVENT_UPLOAD_IMAGE_KEY } from '../common/constant/event-key';
import { EventUploadImageDto } from './dto/upload-image.dto';
import { UploadEvents, UploadEventsDocument } from './entities/upload-events';

@Injectable()
export class UploadEventsService {
  private logger = new Logger(UploadEventsService.name);
  constructor(
    @InjectModel(UploadEvents.name)
    private uploadEventsModel: Model<UploadEventsDocument>,
  ) {}

  @OnEvent(EVENT_UPLOAD_IMAGE_KEY)
  handleUploadImageEvent(payload: EventUploadImageDto) {
    this.upsert(payload);
  }

  create(eventUploadDto: EventUploadImageDto) {
    try {
      const item = new this.uploadEventsModel({
        itemId: new Types.ObjectId(eventUploadDto.itemId),
        createdBy: new Types.ObjectId(eventUploadDto.createdBy),
      });
      return item.save();
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async upsert(eventUploadDto: EventUploadImageDto) {
    try {
      const itemId = new Types.ObjectId(eventUploadDto.itemId);
      const createdBy = new Types.ObjectId(eventUploadDto.createdBy);

      const filter = { itemId, createdBy };
      const update = { ...filter };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const item = await this.uploadEventsModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return item;
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async findAll(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy',
          },
        },
        {
          $unwind: '$createdBy',
        },

        {
          $lookup: {
            from: 'zuluassortments',
            localField: 'itemId',
            foreignField: '_id',
            as: 'item',
          },
        },
        {
          $unwind: '$item',
        },
        {
          $project: {
            _id: 1,
            createdBy: {
              _id: 1,
              name: 1,
              email: 1,
            },
            item: {
              _id: 1,
              name: 1,
              customerItemNo: 1,
              itemNo: 1,
            },
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: {
            updatedAt: -1, // Sort from latest to oldest
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ];

      const [items, totalItems] = await Promise.all([
        this.uploadEventsModel.aggregate(pipeline),
        this.uploadEventsModel.countDocuments(),
      ]);

      const nextPage = totalItems > skip + limit ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      const totalPages = Math.ceil(totalItems / limit);

      return { items, nextPage, prevPage, totalPages, page, limit };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }
}
