import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EVENT_RETAKE_IMAGE_KEY } from 'src/common/constant/event-key';
import { FilesService } from 'src/files/files.service';
import { CreatePcfImageDto } from './dto/create-pcf-image.dto';
import { UpdatePcfImageDto } from './dto/update-pcf-image.dto';
import { PcfImage } from './entities/pcf-image.entity';

@Injectable()
export class PcfImagesService {
  constructor(
    @InjectModel(PcfImage.name) private pcfImageModel: Model<PcfImage>,
    private filesService: FilesService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createPcfImageDto: CreatePcfImageDto): Promise<PcfImage> {
    try {
      const newPcfImage = new this.pcfImageModel(createPcfImageDto);
      return await newPcfImage.save();
    } catch (error) {
      throw new InternalServerErrorException('Error creating PCF Image');
    }
  }

  async createFromFiles(
    assortmentId: string,
    files: Express.Multer.File[],
  ): Promise<Types.ObjectId[]> {
    const createdImageIds: Types.ObjectId[] = [];
    try {
      for (const file of Object.values(files)) {
        const createdFile = await this.filesService.create(file);
        const itemId = new Types.ObjectId(assortmentId);

        const newPcfImage = new this.pcfImageModel({
          fileData: createdFile,
          field: file.fieldname,
          itemId,
        });
        const savedImage = await newPcfImage.save();
        createdImageIds.push(savedImage._id);
      }
      return createdImageIds;
    } catch (error) {
      throw new InternalServerErrorException('Error creating PCF Images');
    }
  }

  async findAll(): Promise<PcfImage[]> {
    try {
      return await this.pcfImageModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching PCF Images');
    }
  }

  async findOne(id: string): Promise<PcfImage> {
    try {
      const pcfImage = await this.pcfImageModel.findById(id).lean().exec();
      if (!pcfImage) {
        throw new NotFoundException(`PCF Image with ID ${id} not found`);
      }
      return pcfImage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching PCF Image');
    }
  }

  async update(
    id: string,
    updatePcfImageDto: UpdatePcfImageDto,
    userId: string,
  ): Promise<PcfImage> {
    try {
      const updatedPcfImage = await this.pcfImageModel
        .findByIdAndUpdate(id, updatePcfImageDto, { new: true })
        .exec();
      if (!updatedPcfImage) {
        throw new NotFoundException(`PCF Image with ID ${id} not found`);
      }

      if ('isApproved' in updatePcfImageDto && !updatePcfImageDto.isApproved) {
        this.eventEmitter.emit(EVENT_RETAKE_IMAGE_KEY, {
          itemId: updatedPcfImage.itemId,
          createdBy: userId,
        });
      }

      return updatedPcfImage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating PCF Image');
    }
  }

  async remove(id: string): Promise<PcfImage> {
    try {
      const deletedPcfImage = await this.pcfImageModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedPcfImage) {
        throw new NotFoundException(`PCF Image with ID ${id} not found`);
      }
      this.filesService.remove(deletedPcfImage.fileData._id.toString());
      return deletedPcfImage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing PCF Image');
    }
  }

  async deleteByIds(ids: Types.ObjectId[]): Promise<void> {
    const pcfImages = await this.pcfImageModel
      .find({ _id: { $in: ids } })
      .lean()
      .exec();

    if (pcfImages.length > 0) {
      const pcfBulkOperations = ids.map((id) => ({
        deleteOne: { filter: { _id: id } },
      }));

      const imageIds = pcfImages
        .filter((pcfImage) => pcfImage._id.toString())
        .map((pcfImage) => pcfImage.fileData._id);

      try {
        await this.pcfImageModel.bulkWrite(pcfBulkOperations);
        await this.filesService.removeBulk(imageIds);
      } catch (error) {
        throw new InternalServerErrorException(
          'Error deleting PCF Images and associated files',
        );
      }
    }
  }
}
