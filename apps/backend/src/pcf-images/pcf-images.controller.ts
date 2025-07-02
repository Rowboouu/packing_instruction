import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { CreatePcfImageDto } from './dto/create-pcf-image.dto';
import { UpdatePcfImageDto } from './dto/update-pcf-image.dto';
import { PcfImagesService } from './pcf-images.service';

@Controller('pcf-images')
export class PcfImagesController {
  constructor(private readonly pcfImagesService: PcfImagesService) {}

  @Post()
  create(@Body() createPcfImageDto: CreatePcfImageDto) {
    return this.pcfImagesService.create(createPcfImageDto);
  }

  @Get()
  findAll() {
    return this.pcfImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pcfImagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePcfImageDto: UpdatePcfImageDto,
    @Req() req,
  ) {
    return this.pcfImagesService.update(id, updatePcfImageDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pcfImagesService.remove(id);
  }
}
