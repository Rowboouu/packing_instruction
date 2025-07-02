import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileData, FileDocument } from './entities/file.entity';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(@InjectModel(FileData.name) private fileModel: Model<FileData>) {}

  async create(createFileDto: CreateFileDto): Promise<FileDocument> {
    try {
      const createdFile = new this.fileModel(createFileDto);
      return await createdFile.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create file: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<FileData[]> {
    try {
      return await this.fileModel
        .find()
        .collation({ locale: 'en_US', strength: 1 })
        .sort({ originalName: 1 })
        .lean()
        .exec();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find files: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<FileData> {
    try {
      const file = await this.fileModel.findById(id).lean().exec();
      if (!file) {
        throw new NotFoundException(`File with id ${id} not found`);
      }
      return file;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to find file with id ${id}: ${error.message}`,
        )
      );
    }
  }

  async findOneByFilename(name: string): Promise<FileData> {
    try {
      const file = await this.fileModel.findOne({ filename: name }).exec();
      if (!file) {
        throw new NotFoundException(`File with filename ${name} not found`);
      }
      return file;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to find file with id ${name}: ${error.message}`,
        )
      );
    }
  }

  async update(id: string, updateFileDto: UpdateFileDto): Promise<FileData> {
    try {
      const updatedFile = await this.fileModel
        .findByIdAndUpdate(id, updateFileDto, { new: true })
        .exec();
      if (!updatedFile) {
        throw new NotFoundException(`File with id ${id} not found`);
      }
      return updatedFile;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to update file with id ${id}: ${error.message}`,
        )
      );
    }
  }

  async remove(id: string): Promise<FileData> {
    try {
      const deletedFile = await this.fileModel.findByIdAndDelete(id).exec();
      if (!deletedFile) {
        throw new NotFoundException(`File with id ${id} not found`);
      }
      console.log(deletedFile);
      const filePath = path.join(process.cwd(), deletedFile.path);

      fs.unlink(filePath, (error) => {
        if (error) {
          this.logger.log(`Failed to delete file: ${error.message}`);
        }
      }); // Delete the file from the filesystem

      return deletedFile;
    } catch (error) {
      throw (
        error ||
        new InternalServerErrorException(
          `Failed to delete file with id ${id}: ${error.message}`,
        )
      );
    }
  }

  async removeBulk(ids: Types.ObjectId[]): Promise<FileData[]> {
    try {
      const deleteResults = await this.fileModel.bulkWrite(
        ids.map((id) => ({
          deleteOne: { filter: { _id: id } },
        })),
      );

      if (deleteResults.deletedCount !== ids.length) {
        throw new NotFoundException(
          `Some files with the provided ids were not found`,
        );
      }

      const deletedFiles = await this.fileModel
        .find({ _id: { $in: ids } })
        .lean()
        .exec();
      return deletedFiles;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete files with ids ${ids.join(', ')}: ${error.message}`,
      );
    }
  }
}
