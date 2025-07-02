// import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as dayjs from 'dayjs';
// import { LoggerModuleAsyncParams } from 'nestjs-pino';
// import pino from 'pino';
// import { ConfigSchemaType } from '../common/config.schema';

// export const loggerParams: LoggerModuleAsyncParams = {
//   imports: [ConfigModule],
//   inject: [ConfigService],
//   useFactory: async (configService: ConfigService<ConfigSchemaType>) => ({
//     pinoHttp: {
//       name: 'Pack Center',
//       stream: pino.destination({
//         dest: './log/app.log', // omit for stdout
//         minLength: 4096, // Buffer before writing
//         sync: true, // Asynchronous logging
//       }),
//       level: configService.get('NODE_ENV') !== 'production' ? 'trace' : 'trace',
//       redact: {
//         paths: ['req.headers.cookie'],
//         remove: true,
//       },
//       transport: {
//         targets: [
//           {
//             target: 'pino-pretty',
//             options: { colorize: true },
//           },
//           {
//             target: 'pino/file',
//             options: { destination: `${process.cwd()}/log/app.log` },
//           },
//         ],
//       },
//       base: {
//         pid: false,
//       },
//       timestamp: () => `,"time":"${dayjs().format()}"`,
//     },
//   }),
// };

import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import pino from 'pino';
import { ConfigSchemaType } from '../common/config.schema';

export const loggerParams: LoggerModuleAsyncParams = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<ConfigSchemaType>) => {
    const isDev = configService.get('NODE_ENV') !== 'production';
    
    return {
      pinoHttp: {
        name: 'Pack Center',
        level: 'trace',
        redact: {
          paths: ['req.headers.cookie'],
          remove: true,
        },
        // Simplified transport for development
        transport: isDev ? {
          target: 'pino-pretty',
          options: { colorize: true },
        } : undefined,
        base: {
          pid: false,
        },
        timestamp: () => `,"time":"${dayjs().format()}"`,
      },
    };
  },
};