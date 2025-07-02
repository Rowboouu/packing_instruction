import { diskStorage, memoryStorage } from 'multer';

export const templateDiskstorage = diskStorage({
  destination: './uploads/templates',
});

export const imagesMemoryStorage = memoryStorage();

export const imagesDiskstorage = diskStorage({
  destination: './uploads/images',
});
