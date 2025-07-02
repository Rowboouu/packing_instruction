import { Injectable, PipeTransform } from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';
import * as sharp from 'sharp';
import { FileObject } from 'src/zulu-assortments/uploadObject';

@Injectable()
export class SharpPipe
  implements PipeTransform<FileObject, Promise<FileObject>>
{
  async transform(files: FileObject): Promise<FileObject> {
    for (const key in files) {
      if (files[key]) {
        for (let i = 0; i < files[key].length; i++) {
          const image = files[key][i];

          const randomName = crypto.randomBytes(16).toString('hex');
          const originalName = path.parse(image.originalname).name;

          const filename = `${randomName}.webp`;
          const destination = './uploads/images';
          const destPath = `${destination}/${filename}`;

          const uploadLocation = path.join(process.cwd(), destPath);

          const sharpImage = await sharp(image.buffer)
            .webp({ quality: 80 })
            .toFile(uploadLocation);

          delete image.buffer; // Remove the buffer property

          image.originalName = `${originalName}.webp`; // Add the originalName property
          image.size = sharpImage.size; // Add the size property
          image.filename = filename; // Add the new filename to the file object
          image.destination = destination; // Add the destination property
          image.path = destPath; // Add the uploadPath property
          image.mimetype = 'image/webp'; // Change the mimetype to 'image/webp'
        }
      }
    }
    return files;
  }
}
