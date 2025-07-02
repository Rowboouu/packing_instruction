import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { exec } from 'child_process';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { Cluster } from 'puppeteer-cluster';
import { PcfImage } from 'src/pcf-images/entities/pcf-image.entity';
import { ZuluAssortment } from 'src/zulu-assortments/entities/zulu-assortment.entity';
import { FileObject } from 'src/zulu-assortments/uploadObject';
import { ZuluAssortmentsService } from 'src/zulu-assortments/zulu-assortments.service';
import { ZuluSalesOrder } from 'src/zulu-sales-orders/entities/zulu-sales-order.entity';
import { ZuluSalesOrdersService } from 'src/zulu-sales-orders/zulu-sales-orders.service';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class GCPdfRerportsService {
  private logger = new Logger(GCPdfRerportsService.name);

  constructor(
    private zuluAssortmentsService: ZuluAssortmentsService,
    private zuluSalesOrdersService: ZuluSalesOrdersService,
    // private configService: ConfigService<ConfigSchemaType>,
    @Inject('CLUSTER') private readonly cluster: Cluster,
  ) {}

  async createHtml(itemId: string) {
    const assortment = await this.zuluAssortmentsService.findOne(itemId);
    const order = await this.zuluSalesOrdersService.findOneByOrderId(
      assortment.orderId,
    );
    const html = this.generateHtml(assortment, order);
    return html;
  }

  async createReport(itemId: string) {
    try {
      const assortment = await this.zuluAssortmentsService.findOne(itemId);
      const order = await this.zuluSalesOrdersService.findOneByOrderId(
        assortment.orderId,
      );
      console.time('generateHtml');
      const html = this.generateHtml(assortment, order);
      console.timeEnd('generateHtml');

      console.time('executeCluster');
      const pdfBuffer = await this.cluster.execute({ html });
      console.timeEnd('executeCluster');

      console.time('compressBuffer');
      const compressedBuffer = await this.compressBuffer(pdfBuffer);
      console.timeEnd('compressBuffer');
      return {
        fileName: `${assortment.customerItemNo} Package Confirmation Form.pdf`,
        mimetype: 'application/pdf',
        buffer: compressedBuffer,
      };
    } catch (error) {
      this.logger.error(error.message);
      console.log(error);
      this.logger.error('++++++++++++++++++++++++++++++++++');
      throw new InternalServerErrorException(error);
    }
  }

  generateHtml(assortment: ZuluAssortment, order: ZuluSalesOrder) {
    const today = format(new Date(), 'MMMM-dd,yyyy');
    const template = fs.readFileSync(
      path.join(process.cwd(), '/public/html/GCPdf.ejs'),
      'utf-8',
    );

    const labels = assortment.labels?.find((label) =>
      label.hasOwnProperty('unit'),
    );

    const unitVal = assortment.unit ?? labels?.['unit'].value ?? 'PR';
    const itemInCarton =
      assortment.itemInCarton || assortment.productInCarton || 0;
    const itemPerUnit =
      assortment.itemPerUnit || assortment.productPerUnit || 0;

    const cubicUnit = assortment.cubicUnit || 'cuft';
    const itemCuft = parseFloat(
      assortment.itemCUFT || assortment.masterCUFT || '0',
    ).toFixed(2);

    const wtUnit = assortment.wtUnit || 'lbs';
    const itemGrossWeight = parseFloat(
      assortment.itemGrossWeight || assortment.masterGrossWeight || '0',
    ).toFixed(2);

    const imgSrcs = this.groupPCFImages(assortment.pcfImages || []);

    const html = ejs.render(template, {
      assortment,
      order,
      today,
      gcLogo: this.toBase64('/public/images/gc_logo.png'),
      itemInCarton: `${itemInCarton} ${unitVal}`,
      itemPerUnit: `${itemPerUnit} ${unitVal}`,
      itemCuft: `${itemCuft} ${cubicUnit}`,
      itemWeight: `${itemGrossWeight} ${wtUnit}`,
      masterUccLabel: imgSrcs.masterUccLabel?.[0],
      innerItemLabel: imgSrcs.innerItemLabel?.[0],
      innerUccLabel: imgSrcs.innerUccLabel?.[0],
      upcLabelFront: imgSrcs.upcLabelFront?.[0],
      upcLabelBack: imgSrcs.upcLabelBack?.[0],
      masterCarton: imgSrcs.masterCarton?.[0],
      innerCarton: imgSrcs.innerCarton?.[0],
      masterShippingMark: imgSrcs.masterShippingMark?.[0],
      innerItemUccLabel: imgSrcs.innerItemUccLabel?.[0],
      upcPlacement: imgSrcs.upcPlacement ?? [],
      productPictures: imgSrcs.productPictures ?? [],
      protectivePackaging: imgSrcs.protectivePackaging ?? [],
    });

    return html;
  }

  toBase64(location: string) {
    let filePath = path.join(process.cwd(), location);

    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), '/public/images/placeholder.png');
    }

    return `data:image/png;base64,${fs.readFileSync(filePath, { encoding: 'base64' })}`;
  }

  groupPCFImages(images: PcfImage[]) {
    return images.reduce(
      (acc, curr) => {
        const field = curr.field as keyof FileObject;
        if (!acc[field]) {
          acc[field] = [];
        }

        const src = this.toBase64(curr.fileData.path);

        acc[field].push(src);
        return acc;
      },
      {} as Record<keyof FileObject, string[]>,
    );
  }

  async compressBuffer(buffer: Buffer) {
    const basePath = '/tmp'; //path.join(process.cwd(), '/temp');
    const inputId = crypto.randomBytes(16).toString('hex');
    const outputId = crypto.randomBytes(16).toString('hex');

    const inputPath = path.join(basePath, inputId);
    const outputPath = path.join(basePath, outputId);

    try {
      await fs.promises.writeFile(inputPath, buffer);

      const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/printer -dNOPAUSE -dQUIET -dBATCH -sOutputFile=${outputPath} ${inputPath}`;
      await execAsync(command);

      const outputBuffer = await fs.promises.readFile(outputPath);

      return outputBuffer;
    } catch (error) {
      this.logger.error(`Error compressing buffer: ${error}`);
      throw error;
    } finally {
      // Ensure the temporary files are deleted even if an error occurs
      await fs.promises.unlink(inputPath).catch(this.logger.error);
      await fs.promises.unlink(outputPath).catch(this.logger.error);
    }
  }
}
