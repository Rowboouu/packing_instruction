import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileData, FileDataSchema } from './entities/file.entity';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FileData.name, schema: FileDataSchema },
    ]),
  ],
  providers: [FilesService],
  exports: [FilesService],
  controllers: [FilesController],
})
export class FilesModule {}
