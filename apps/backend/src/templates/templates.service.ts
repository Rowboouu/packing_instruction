import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FilesService } from 'src/files/files.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import {
  UpdateTemplateDto,
  UpdateTemplateWithFileDto,
} from './dto/update-template.dto';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private templateModel: Model<Template>,
    private filesService: FilesService,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
    file: Express.Multer.File,
  ): Promise<Template> {
    try {
      const createdFile = await this.filesService.create(file);
      const createdTemplate = new this.templateModel({
        ...createTemplateDto,
        fileData: createdFile,
      });
      return await createdTemplate.save();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create template: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Template[]> {
    try {
      return await this.templateModel
        .find()
        .populate({ path: 'fileData' })
        .collation({ locale: 'en', strength: 1 }) // Specify a case-insensitive collation
        .sort({ name: 1 }) // Sort by name in descending order
        .lean()
        .exec();
    } catch (error) {
      throw new Error(`Failed to find templates: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<Template> {
    try {
      const template = await this.templateModel
        .findById(id)
        .populate({ path: 'fileData' })
        .lean()
        .exec();

      if (!template) {
        throw new NotFoundException(`Template with id ${id} not found`);
      }

      return template;
    } catch (error) {
      throw (
        error ||
        new Error(`Failed to find template with id ${id}: ${error.message}`)
      );
    }
  }

  async update(
    id: string,
    updateTemplateDto: UpdateTemplateDto,
    file?: Express.Multer.File,
  ): Promise<Template> {
    try {
      const updateObject: UpdateTemplateWithFileDto = { ...updateTemplateDto };

      if (file) {
        const createdFile = await this.filesService.create(file);
        updateObject.fileData = createdFile;
      }

      return await this.templateModel
        .findByIdAndUpdate(id, updateObject, { new: true })
        .exec();
    } catch (error) {
      throw new Error(
        `Failed to update template with id ${id}: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<Template> {
    try {
      return await this.templateModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new Error(
        `Failed to delete template with id ${id}: ${error.message}`,
      );
    }
  }
}
