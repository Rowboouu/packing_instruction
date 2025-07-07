import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigSchemaType } from './common/config.schema';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });
    
    const config = app.get(ConfigService<ConfigSchemaType>);
    const port = config.get('PORT') || 5006; // Default fallback
    const origins = config.get('ORIGINS') || 'http://localhost:5138';

    console.log('🔧 Config loaded:');
    console.log(`  PORT: ${port}`);
    console.log(`  ORIGINS: ${origins}`);
    console.log(`  ORIGINS type: ${typeof origins}`);

    // Remove global prefix - let controllers define their own paths
    // app.setGlobalPrefix('api'); // REMOVED THIS
    
    // Remove versioning if not needed
    // app.enableVersioning({
    //   defaultVersion: '1',
    //   type: VersioningType.URI,
    // });

    // Static file serving (keep if needed)
    app.use('/static', express.static(join(process.cwd(), 'public')));
    app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
    
    // Body parsing with reasonable limits
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));
    
    // CORS configuration - handle different types
    const corsOrigins = typeof origins === 'string' 
      ? origins.split(',').map(origin => origin.trim())
      : Array.isArray(origins) 
        ? origins 
        : ['http://localhost:5138']; // fallback

    app.enableCors({
      origin: corsOrigins,
      credentials: true,
    });
    
    // Security headers (simplified)
    app.use(helmet({
      contentSecurityPolicy: false,
    }));
    
    app.use(cookieParser());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        whitelist: true,
        forbidNonWhitelisted: false, // Don't throw errors for extra fields
      }),
    );
    
    await app.listen(port);
    
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

bootstrap();