import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { EVENT_RETAKE_IMAGE_KEY } from 'src/common/constant/event-key';
import { CreateRetakeDto } from './dto/create-retake.dto';
import { Retake, RetakeDocument } from './entities/retake.entity';

@Injectable()
export class RetakesService {
  private logger = new Logger(RetakesService.name);

  constructor(
    @InjectModel(Retake.name) private retakeModel: Model<RetakeDocument>,
  ) {}

  @OnEvent(EVENT_RETAKE_IMAGE_KEY)
  handleUploadImageEvent(payload: CreateRetakeDto) {
    this.upsert(payload);
  }

  create(createRetakeDto: CreateRetakeDto) {
    try {
      const createdRetake = new this.retakeModel(createRetakeDto);
      return createdRetake.save();
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async upsert(createRetakeDto: CreateRetakeDto) {
    console.log(createRetakeDto);
    try {
      const itemId = createRetakeDto.itemId;
      const createdBy = new Types.ObjectId(createRetakeDto.createdBy);

      const filter = { itemId, createdBy };
      const update = { ...filter };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      return await this.retakeModel.findOneAndUpdate(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException();
    }
  }

  async findAll(page: number, limit: number, userId: string, isDone?: string) {
    try {
      const skip = (page - 1) * limit;
      const excludedUser = new Types.ObjectId(userId);

      const pipeline: PipelineStage[] = [
        {
          $match: {
            createdBy: { $ne: excludedUser },
          },
        },
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
          $lookup: {
            from: 'pcfimages',
            localField: 'item.pcfImages',
            foreignField: '_id',
            as: 'pcfImages',
          },
        },
        {
          $addFields: {
            isDone: {
              $cond: {
                if: {
                  $eq: [
                    {
                      $size: {
                        $filter: {
                          input: '$pcfImages',
                          as: 'pcfImage',
                          cond: {
                            $eq: ['$$pcfImage.isApproved', false],
                          },
                        },
                      },
                    },
                    0,
                  ],
                },
                then: true,
                else: false,
              },
            },
          },
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
            isDone: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ];

      if (isDone) {
        pipeline.push({
          $match: {
            isDone: isDone === '1',
          },
        });
      }

      pipeline.push(
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
      );

      const [items, totalItems] = await Promise.all([
        this.retakeModel.aggregate(pipeline),
        this.retakeModel.countDocuments(),
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
