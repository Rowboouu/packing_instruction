import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { OptionalUser } from 'src/common/decorators/optional.decorator';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @OptionalUser()
  @Get('static/:filename')
  async findOneByFilename(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req,
  ) {
    const file = await this.filesService.findOneByFilename(filename);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const isImage = file.mimetype.includes('image');
    if (!isImage && !req.user) {
      throw new UnauthorizedException();
    }

    const filePath = join(process.cwd(), file.destination, file.filename);

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.originalname}"`,
    });

    if (existsSync(filePath)) {
      const fileStream = createReadStream(filePath);
      return new StreamableFile(fileStream);
    } else {
      if (isImage) {
        const placeholderPath = join(
          process.cwd(),
          '/public/images',
          'placeholder.png',
        );
        const placeholderStream = createReadStream(placeholderPath);
        return new StreamableFile(placeholderStream);
      } else {
        throw new NotFoundException('File not found');
      }
    }
  }
}
