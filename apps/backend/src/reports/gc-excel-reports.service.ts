import { Injectable, Logger } from '@nestjs/common';
import { format } from 'date-fns';
import { Cell, CellValue, Workbook } from 'exceljs';
import * as fs from 'fs';
import sizeOf from 'image-size';
import { join } from 'path';
import * as sharp from 'sharp';
import { CustomerTemplatesService } from 'src/customer-templates/customer-templates.service';
import { FileData } from 'src/files/entities/file.entity';
import { ZuluAssortment } from 'src/zulu-assortments/entities/zulu-assortment.entity';
import { ZuluAssortmentsService } from 'src/zulu-assortments/zulu-assortments.service';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';
import { ExcelReportImageDimension, ImageDimension } from './report-types';

@Injectable()
export class GCExcelReportsService {
  private logger = new Logger(GCExcelReportsService.name);
  private workbook: Workbook;

  constructor(
    private zuluAssortmentsService: ZuluAssortmentsService,
    private customerTemplatesService: CustomerTemplatesService,
    private zuluSalesOrdersService: ZuluSalesOrdersService,
  ) {
    this.workbook = new Workbook();
  }

  private singleItem: Partial<ExcelReportImageDimension> = {
    masterUccLabel: { width: 580, height: 280 },
    masterShippingMark: { width: 530, height: 400 },
    masterCarton: { width: 530, height: 420 },
    innerItemLabel: { width: 380, height: 195 },
    innerUccLabel: { width: 330, height: 160 },
    innerItemUccLabel: { width: 530, height: 400 },
    innerCarton: { width: 530, height: 420 },
    upcLabelFront: { width: 375, height: 290 },
    upcLabelBack: { width: 258, height: 296 },
  };

  private multiItem: Partial<ExcelReportImageDimension> = {
    upcPlacement: { width: 1125, height: 200 },
    productPictures: { width: 535, height: 3600 },
    protectivePackaging: { width: 350, height: 750 },
  };

  private template = {
    destination: 'public/templates',
    filename: 'gc_default_template.xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    originalname: 'Package Confirmation Form.xlsx',
  };

  private logoPath = join(process.cwd(), 'public', 'images', 'gc_logo.png');

  private canvasBackground = { r: 0, g: 255, b: 255, alpha: 0 };

  async createReport(itemId: string) {
    const assortment = await this.zuluAssortmentsService.findOne(itemId);
    const order = await this.zuluSalesOrdersService.findOneByOrderId(
      assortment.orderId,
    );

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // IMPORTANT! call this method to read the template file
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const template = await this.getWorkbookTemplate(order.partnerId);

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // ######## Form text fields ########
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const labels = assortment.labels?.find((label) =>
      label.hasOwnProperty('unit'),
    );

    const unitVal = labels?.['unit'].value ?? 'PR';

    const itemInCarton =
      assortment.itemInCarton || assortment.productInCarton || 0;
    const itemPerUnit =
      assortment.itemPerUnit || assortment.productPerUnit || 0;
    const unit = assortment.unit ?? unitVal;
    const itemCUFT =
      assortment.itemCUFT || parseFloat(assortment.masterCUFT ?? '0');
    const cubicUnit = assortment.cubicUnit ?? 'cuft';
    const itemGrossWeight =
      assortment.itemGrossWeight ||
      parseFloat(assortment.masterGrossWeight ?? '0');
    const wtUnit = assortment.wtUnit ?? 'lbs';

    this.setCellValueForKey('currentDate', format(new Date(), 'MMM-dd,yyyy'));
    this.setCellValueForKey('customerItemNo', assortment.customerItemNo);
    this.setCellValueForKey('customerPoNo', order.customerPoNo);
    this.setCellValueForKey('productInCarton', `${itemInCarton} ${unit}`);
    this.setCellValueForKey('productPerUnit', `${itemPerUnit} ${unit}`);
    this.setCellValueForKey('masterCUFT', itemCUFT);
    this.setCellValueForKey('cubicUnit', cubicUnit);
    this.setCellValueForKey('masterGrossWeight', itemGrossWeight);
    this.setCellValueForKey('wtUnit', wtUnit);

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // For each static image
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    const sheet = this.workbook.worksheets[0]; //workbook.getWorksheet('Sheet1');

    const groupedImages = this.groupImagesByField(assortment);

    for (const [field, dimension] of Object.entries(this.singleItem)) {
      const cells = this.getCellsForKey(field);

      for (const [index, cell] of cells.entries()) {
        const pcfImage = groupedImages[field]?.[index];

        if (pcfImage) {
          const col = Number(cell.col) - 1;
          const row = Number(cell.row) - 1;

          const imageId = await this.generateWorkbookImage(pcfImage, dimension);

          sheet.addImage(imageId, {
            tl: { col, row },
            ext: dimension,
            editAs: 'absolute',
          });
        }
      }
    }
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // LOGO assingment
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const gcLogoCells = this.getCellsForKey('gcLogo');
    const logoImageId = await this.generateLogoImage({
      width: 140,
      height: 100,
    });

    for (const cell of gcLogoCells) {
      const col = Number(cell.col) - 1;
      const row = Number(cell.row) - 1;

      sheet.addImage(logoImageId, {
        tl: { col, row },
        ext: { width: 140, height: 100 },
        editAs: 'absolute',
      });
    }

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // For each dynamic/multi images fields
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    for (const [field, dimension] of Object.entries(this.multiItem)) {
      const cells = this.getCellsForKey(field);
      const pcfImages = groupedImages[field] || [];

      if (field === 'upcPlacement') {
        const { imageId, canvasDimension } =
          await this.generateDynamicWidthImage(pcfImages, dimension);

        for (const cell of cells) {
          const col = Number(cell.col) - 1;
          const row = Number(cell.row) - 1;

          sheet.addImage(imageId, {
            tl: { col, row },
            ext: canvasDimension,
            editAs: 'absolute',
          });
        }
      } else {
        const imagesPerCell = Math.ceil(pcfImages.length / cells.length);

        const imagesByCell = cells.map((cell, index) => ({
          cell,
          pcfImages: pcfImages.slice(
            index * imagesPerCell,
            (index + 1) * imagesPerCell,
          ),
        }));

        let cellHighest = 0;
        for (const { cell, pcfImages } of imagesByCell) {
          const { imageId, canvasDimension } =
            await this.generateDynamicHeightImage(pcfImages, dimension);

          const col = Number(cell.col) - 1;
          const row = Number(cell.row) - 1;

          const mergeRowCount = 10;

          if (cellHighest < canvasDimension.height) {
            for (let i = 0; i <= mergeRowCount; i++) {
              sheet.getRow(Number(cell.row) + i).height =
                (canvasDimension.height * 0.77) / mergeRowCount;
            }
            cellHighest = canvasDimension.height;
          }

          sheet.addImage(imageId, {
            tl: { col, row },
            ext: canvasDimension,
            editAs: 'absolute',
          });
        }
      }
    }

    const buffer = await this.workbook.xlsx.writeBuffer();

    return {
      mimetype: template.mimetype,
      fileName: `${assortment.customerItemNo} ${template.originalname}`,
      buffer,
    };
  }
  private async getWorkbookTemplate(partnerId: number) {
    const customerTemplate =
      await this.customerTemplatesService.findOneByCustomerId(partnerId);

    let templateFile = this.template;

    if (customerTemplate) {
      templateFile = customerTemplate.template.fileData;
    }

    const templatePath = join(
      process.cwd(),
      templateFile.destination,
      templateFile.filename,
    );

    this.workbook = new Workbook();
    await this.workbook.xlsx.readFile(templatePath);

    return templateFile;
  }

  private getCellsForKey(key: string, sheetIndex = 0): Cell[] {
    const foundCells: Cell[] = [];
    const worksheet = this.workbook.worksheets[sheetIndex];

    // Check if the worksheet exists
    if (!worksheet) {
      throw new Error(`No worksheet found at index ${sheetIndex}`);
    }
    // Iterate through each row in the worksheet
    worksheet.eachRow((row) => {
      // Iterate through each cell in the row
      row.eachCell((cell) => {
        // Check if the cell value contains the word
        if (cell.value && cell.value.toString().includes(key)) {
          cell.value = '';
          foundCells.push(cell);
        }
      });
    });

    return foundCells;
  }

  private setCellValueForKey(key: string, value: CellValue, sheetIndex = 0) {
    const cells = this.getCellsForKey(key, sheetIndex);
    for (const cell of cells) {
      cell.value = value;
    }
  }

  private computeResizedDimensions(
    imagePath: string,
    { height: maxHeight, width: maxWidth }: ImageDimension,
  ) {
    try {
      const { height: origHeight, width: origWidth, type } = sizeOf(imagePath);
      const imgType = type as 'png' | 'jpeg' | 'gif';
      const origRatio = origWidth / origHeight;

      let newWidth = origWidth;
      let newHeight = origHeight;

      if (maxHeight > origHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * origRatio;
      } else {
        newWidth = maxWidth;
        newHeight = newWidth / origRatio;
      }

      if (newHeight > maxHeight) {
        const ratio = maxHeight / newHeight;
        newHeight = maxHeight;
        newWidth *= ratio;
      }

      if (newWidth > maxWidth) {
        const ratio = maxWidth / newWidth;
        newWidth = maxWidth;
        newHeight *= ratio;
      }

      newWidth = Math.round(newWidth);
      newHeight = Math.round(newHeight);

      return { width: newWidth, height: newHeight, type: imgType };
    } catch (e) {
      this.logger.error('computeResizedDimensions', e);
      return { width: 0, height: 0, type: 'png' };
    }
  }

  private async generateDynamicHeightImage(
    pcfImages: FileData[],
    dimension: ImageDimension,
  ) {
    try {
      let offsetX = 2;
      let totalHeight = offsetX;
      for (const pcfImage of pcfImages) {
        const imagePath = join(
          process.cwd(),
          pcfImage.destination,
          pcfImage.filename,
        );
        if (!fs.existsSync(imagePath)) continue;

        const { height } = this.computeResizedDimensions(imagePath, dimension);

        totalHeight += height + 5;
      }

      // Array to hold the image objects for the composite function
      const composite = [];

      for (let i = 0; i < pcfImages.length; i++) {
        const imagePath = join(
          process.cwd(),
          pcfImages[i].destination,
          pcfImages[i].filename,
        );
        if (!fs.existsSync(imagePath)) continue;

        const { height } = this.computeResizedDimensions(imagePath, dimension);
        const percentage = (height / totalHeight) * 100;

        let maxHeight = dimension.height;
        if (pcfImages.length === 1) {
          maxHeight = height;
        } else {
          maxHeight = Math.floor((dimension.height * percentage) / 100);
        }

        const maxWidth = dimension.width;

        const image = await this.resizeImage(imagePath, {
          height: maxHeight,
          width: maxWidth,
        });

        if (!image) continue;

        const imageMetaData = await sharp(image).metadata();

        composite.push({ input: image, top: offsetX, left: 2 });

        offsetX += imageMetaData.height + 5;
      }

      const canvasDimension = {
        height: totalHeight + 2,
        width: dimension.width,
      };

      const canvas = await this.createCanvas(canvasDimension);

      const imageBuffer = await sharp(canvas)
        .composite(composite)
        .png()
        .toBuffer();

      const imageId = this.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      return { imageId, canvasDimension };
    } catch (e) {
      this.logger.error('generateDynamicHeightImage', e);
      return { imageId: undefined, canvasDimension: undefined };
    }
  }

  private async generateDynamicWidthImage(
    pcfImages: FileData[],
    dimension: ImageDimension,
  ) {
    try {
      let offsetY = 2;
      let totalWidth = offsetY;
      for (const pcfImage of pcfImages) {
        const imagePath = join(
          process.cwd(),
          pcfImage.destination,
          pcfImage.filename,
        );
        if (!fs.existsSync(imagePath)) continue;

        const { width } = this.computeResizedDimensions(imagePath, dimension);

        totalWidth += width + 5;
      }
      // Array to hold the image objects for the composite function
      const composite = [];

      for (let i = 0; i < pcfImages.length; i++) {
        const imagePath = join(
          process.cwd(),
          pcfImages[i].destination,
          pcfImages[i].filename,
        );
        if (!fs.existsSync(imagePath)) continue;

        const { width } = this.computeResizedDimensions(imagePath, dimension);
        const percentage = (width / totalWidth) * 100;

        const maxHeight = dimension.height;
        let maxWidth = dimension.width;
        if (pcfImages.length === 1) {
          maxWidth = width;
        } else {
          maxWidth = Math.floor((dimension.width * percentage) / 100);
        }

        const image = await this.resizeImage(imagePath, {
          height: maxHeight,
          width: maxWidth,
        });

        if (!image) continue;

        const imageMetaData = await sharp(image).metadata();

        // Add the image object to the array
        composite.push({ input: image, left: offsetY, top: 1 });

        offsetY += imageMetaData.width + 5;
      }

      const canvasDimension = {
        height: dimension.height,
        width: totalWidth,
      };

      const canvas = await this.createCanvas(canvasDimension);

      const imageBuffer = await sharp(canvas)
        .composite(composite)
        .png()
        .toBuffer();

      const imageId = this.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });
      return { imageId, canvasDimension };
    } catch (e) {
      this.logger.error('generateDynamicWidthImage', e);
      return { imageId: undefined, canvasDimension: { height: 0, width: 0 } };
    }
  }

  private async generateWorkbookImage(
    pcfImage: FileData,
    dimension: ImageDimension,
  ) {
    try {
      const imagePath = join(
        process.cwd(),
        pcfImage.destination,
        pcfImage.filename,
      );

      const canvas = await this.createCanvas(dimension);
      const image = await this.resizeImage(imagePath, dimension);

      const composite = [];

      if (image) {
        composite.push({ input: image, gravity: 'center', top: 0, left: 0 });
      }

      const imageBuffer = await sharp(canvas)
        .composite(composite)
        .png()
        .toBuffer();

      const imageId = this.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      return imageId;
    } catch (e) {
      this.logger.error('generateWorkbookImage', e);
      return undefined;
    }
  }

  private async generateLogoImage(dimension: ImageDimension) {
    try {
      const canvas = await this.createCanvas(dimension);
      const image = await this.resizeImage(this.logoPath, dimension);
      const composite = [];

      if (image) {
        composite.push({ input: image, gravity: 'center', top: 0, left: 0 });
      }

      const imageBuffer = await sharp(canvas)
        .composite(composite)
        .png()
        .toBuffer();

      const imageId = this.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      return imageId;
    } catch (e) {
      this.logger.error('generateLogoImage', e);
      return undefined;
    }
  }

  private async resizeImage(
    imagePath: string,
    dimension: ImageDimension,
  ): Promise<Buffer | undefined> {
    try {
      if (!fs.existsSync(imagePath)) {
        return undefined;
      }

      const { height, width } = this.computeResizedDimensions(
        imagePath,
        dimension,
      );

      const resizedImage = await sharp(imagePath)
        .resize(
          Math.min(dimension.width, Math.floor(width)),
          Math.min(dimension.height, Math.floor(height)),
          {
            fit: 'contain',
          },
        )
        .toBuffer();

      return resizedImage;
    } catch (e) {
      this.logger.error('resizeImage', e);
      return undefined;
    }
  }

  private async createCanvas({ height, width }: ImageDimension) {
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: this.canvasBackground,
      },
    })
      .png()
      .toBuffer();
  }

  private groupImagesByField(assortment: ZuluAssortment) {
    return assortment.pcfImages.reduce(
      (acc, image) => {
        acc[image.field] = [...(acc[image.field] || []), image.fileData];
        return acc;
      },
      {} as Record<string, FileData[]>,
    );
  }
}
