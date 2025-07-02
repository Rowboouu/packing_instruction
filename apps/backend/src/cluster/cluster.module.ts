import { Global, Module } from '@nestjs/common';
import { Cluster } from 'puppeteer-cluster';

@Global()
@Module({
  providers: [
    {
      provide: 'CLUSTER',
      useFactory: async () => {
        const cluster = await Cluster.launch({
          concurrency: Cluster.CONCURRENCY_CONTEXT,
          maxConcurrency: 4,
          timeout: 300000,
          puppeteerOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreDefaultArgs: ['--disable-extensions'],
          },
        });

        cluster.task(async ({ page, data: { html } }) => {
          console.time('setContent');
          await page.setContent(html);
          console.timeEnd('setContent');

          console.time('addStyleTag1');
          await page.addStyleTag({
            path: process.cwd() + '/public/assets/css/pdf.style.css',
          });
          console.timeEnd('addStyleTag1');

          console.time('addStyleTag2');
          await page.addStyleTag({
            path: process.cwd() + '/public/assets/css/bootstrap.min.css',
          });
          console.timeEnd('addStyleTag2');

          console.time('generatePdf');
          const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            timeout: 0,
          });
          console.timeEnd('generatePdf');

          return pdfBuffer;
        });

        return cluster;
      },
    },
  ],
  exports: ['CLUSTER'],
})
export class ClusterModule {}
