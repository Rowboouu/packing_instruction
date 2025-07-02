import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as archiver from 'archiver';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { imagesMemoryStorage } from 'src/common/multer-storage';
import { QueryParamsDto } from 'src/common/pagination/pagination-query.dto';
import { SharpPipe } from 'src/common/pipes/sharp.pipes';
import { CreateZuluAssortmentDto } from './dto/create-zulu-assortment.dto';
import { PCFErrorDTO } from './dto/pcf-error.dto';
import { UpdateZuluAssortmentDto } from './dto/update-zulu-assortment.dto';
import { FileObject, imageUploadField } from './uploadObject';
import { ZuluAssortmentsService } from './zulu-assortments.service';

@Controller('zulu-assortments')
export class ZuluAssortmentsController {
  private logger = new Logger(ZuluAssortmentsController.name);
  constructor(private readonly zuluOrderItemsService: ZuluAssortmentsService) {}

  @Post()
  create(@Body() createZuluAssortmentDto: CreateZuluAssortmentDto) {
    return this.zuluOrderItemsService.create(createZuluAssortmentDto);
  }

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.zuluOrderItemsService.findAllPaginated(
      query.page,
      query.limit,
      query.keyword,
      query.status,
      query.orderId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zuluOrderItemsService.findOne(id);
  }

  @Get(':id/downloads')
  async findOneAndDownload(@Param('id') id: string, @Res() res: Response) {
    try {
      const assort = await this.zuluOrderItemsService.findOne(id);

      const archive = archiver('zip');

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${assort.customerItemNo} - ${assort.itemNo}.zip`,
      );

      archive.pipe(res);

      for (const image of assort.pcfImages) {
        const fileData = image.fileData;
        const imagePath = path.normalize(
          path.join(process.cwd(), fileData.destination, fileData.filename),
        );

        const filename = `${image.field} - ${fileData.originalname}`;

        if (fs.existsSync(imagePath)) {
          archive.append(fs.createReadStream(imagePath), {
            name: filename,
          });
        } else {
          this.logger.error(`File ${imagePath} does not exist`);
        }
      }

      await archive.finalize();
    } catch (err) {
      this.logger.error(`Error creating archive`, err);
      res.status(500).send('Error creating archive');
    }
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateZuluAssortmentDto: UpdateZuluAssortmentDto,
  ) {
    return this.zuluOrderItemsService.update(id, updateZuluAssortmentDto);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(imageUploadField, {
      storage: imagesMemoryStorage,
    }),
  )
  updateFiles(
    @Param('id') id: string,
    @UploadedFiles(SharpPipe) fileObject: FileObject,
    @Body() pcfErrorDTO: PCFErrorDTO,
    @Req() req: any,
  ) {
    const userId = req.user.sub;
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++');
    console.log(pcfErrorDTO);

    return this.zuluOrderItemsService.updateImages(
      id,
      fileObject,
      pcfErrorDTO,
      userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zuluOrderItemsService.remove(id);
  }
}
