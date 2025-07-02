// import { Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
// import { ConfigSchemaType } from '../common/config.schema';

// export const mongooseOptions: MongooseModuleAsyncOptions = {
//   useFactory: async (configService: ConfigService<ConfigSchemaType>) => {
//     const uri = configService.get('DATABASE_URL');
//     const dbName = configService.get('DATABASE_NAME');
//     return {
//       uri: uri,
//       dbName: dbName,
//       connectionFactory(connection, name) {
//         const logger = new Logger(name);

//         connection.on('connected', () => {
//           logger.debug(
//             '++++++++++ Database connection has been established successfully +++++++++',
//             `database: ${connection.name}`,
//             `host: ${connection.host}`,
//             `port: ${connection.port}`,
//           );
//         });
//         connection.on('disconnected', () => {
//           logger.warn('Database connection has been terminated');
//         });
//         connection.on('error', (error) => {
//           logger.error(
//             `Database connection failed due to error: ${error}`,
//             error,
//           );
//         });
//         connection._events.connected();
//         return connection;
//       },
//     };
//   },
//   inject: [ConfigService],
// };

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigSchemaType } from '../common/config.schema';

export const mongooseOptions: MongooseModuleAsyncOptions = {
  useFactory: async (configService: ConfigService<ConfigSchemaType>) => {
    const uri = configService.get('DATABASE_URL');
    const dbName = configService.get('DATABASE_NAME');
    
    return {
      uri: uri,
      dbName: dbName,
      connectionFactory(connection, name) {
        const logger = new Logger(name);

        connection.on('connected', () => {
          logger.debug(
            '++++++++++ Database connection has been established successfully +++++++++',
            `database: ${connection.name}`,
            `host: ${connection.host}`,
            `port: ${connection.port}`,
          );
        });
        
        connection.on('disconnected', () => {
          logger.warn('Database connection has been terminated');
        });
        
        connection.on('error', (error) => {
          logger.error(
            `Database connection failed due to error: ${error}`,
            error,
          );
        });
        
        // Remove this problematic line:
        // connection._events.connected();
        
        return connection;
      },
    };
  },
  inject: [ConfigService],
};